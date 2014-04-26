'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var http = require('http');
var openURL = require('open');
var lazypipe = require('lazypipe');
var wiredep = require('wiredep').stream;
var path = require('path');
var nib = require('nib');
var config;

var testFiles = [
  'app/bower_components/angular/angular.js',
  'app/bower_components/angular-mocks/angular-mocks.js',
  'app/bower_components/angular-resource/angular-resource.js',
  'app/bower_components/angular-cookies/angular-cookies.js',
  'app/bower_components/angular-sanitize/angular-sanitize.js',
  'app/bower_components/angular-route/angular-route.js',
  'app/scripts/*.js',
  'app/scripts/**/*.js',
  'test/mock/**/*.js',
  'test/spec/**/*.js'
];

//////////////////////
// Helper functions //
//////////////////////

function onServerLog(log) {
  console.log($.util.colors.white('[') + $.util.colors.yellow('nodemon') + $.util.colors.white('] ') + log.message);
}

function checkAppReady(cb) {
  var options = {
    host: 'localhost',
    port: config.port,
  };
  http.get(options, function() {
    cb(true);
  }).on('error', function() {
    cb(false);
  });
}

function whenServerReady (cb) {
  var serverReady = false;
  var appReadyInterval = setInterval(function () {
    checkAppReady(function(ready){
      if (!ready || serverReady) { return; }
      clearInterval(appReadyInterval);
      serverReady = true;
      cb();
    });
  }, 100);
}

////////////////////////
// Reusable pipelines //
////////////////////////

var jshint = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var coffeelint = lazypipe()
  .pipe($.coffeelint)
  .pipe($.coffeelint.reporter);

var styles = lazypipe()
  .pipe($.rubySass, {style: 'expanded'})
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

  // src .less
  // .pipe($.less({
  //   paths: [ path.join(__dirname, 'less', 'includes') ]
  // }))

  // src .styl
  // .pipe($.stylus, {use: [nib()], errors: true})

/////////
// CSS //
/////////

gulp.task('clean:css', function () {
  return gulp.src('.tmp/styles', {read: false})
    .pipe($.clean());
});

gulp.task('styles', ['clean:css'], function () {
  return gulp.src('app/styles/**/*.scss')
    .pipe(styles());
});


////////////
// Coffee //
////////////

gulp.task('coffee', function() {
  gulp.src('app/scripts/**/*.coffee')
    .pipe(coffeelint())
    .pipe($.coffee({bare: true}).on('error', $.util.log))
    .pipe(gulp.dest('.tmp/scripts'));
});

/////////////
// Linting //
/////////////

gulp.task('lint', ['lint:gulp', 'lint:server', 'lint:client']);

gulp.task('lint:gulp', function () {
  return gulp.src(['./Gulpfile.js']).pipe(jshint());
});

gulp.task('lint:client', function () {
  return gulp.src(['app/scripts/**/*.js']).pipe(jshint());
});

gulp.task('lint:server', function () {
  return gulp.src([
    'lib/**/*.js',
    'server.js',
  ]).pipe(jshint());
});

///////////
// Start //
///////////

gulp.task('start:client', ['start:server', 'lint:client', 'styles'], function () {
  openURL('http://localhost:' + config.port);
});

gulp.task('start:server', ['lint:server'], function (callback) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require('./lib/config/config');

  $.nodemon({
    script: 'server.js',
    watch: ['lib', 'server.js']
  })
  .on('log', onServerLog);
  whenServerReady(callback);
});

gulp.task('watch', function () {

  $.watch({glob: 'app/styles/**/*.{scss,css}'})
    .pipe($.plumber())
    .pipe(styles())
    .pipe($.livereload());

  $.watch({glob: 'app/views/**/*'})
    .pipe($.plumber())
    .pipe($.livereload());

  $.watch({glob: 'app/scripts/**/*.js'})
    .pipe($.plumber())
    .pipe(jshint())
    .pipe($.livereload());

  // $.watch({glob: 'app/scripts/**/*.coffee'})
  //   .pipe($.plumber())
  //   .pipe(coffeelint())
  //   .pipe($.coffee({bare: true}).on('error', $.util.log))
  //   .pipe(gulp.dest('.tmp/scripts'))
  //   .pipe($.livereload());

  $.watch({glob: '{app/lib/**/*.js,./*.js,test/**/*.js}'})
    .pipe($.plumber())
    .pipe(jshint());

  gulp.watch('bower.json', ['bower']);
});

gulp.task('serve', ['styles', 'lint', 'start:server', 'start:client', 'watch']);

gulp.task('test:server', function () {
  process.env.NODE_ENV = 'test';
  return gulp.src('test/server/**/*.js')
    .pipe($.mocha({reporter: 'spec'}));
});

gulp.task('test:client', function () {
  gulp.src(testFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }));
});

gulp.task('test:client:single', function () {
  return gulp.src(testFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: 'run'
    })).on('error', function (err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src('app/views/index.jade')
    .pipe(wiredep({
      directory: './app/bower_components',
      exclude: ['bootstrap-sass-official']
    }))
  .pipe(gulp.dest('app/views/'));
});

///////////
// Build //
///////////

gulp.task('html', function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src('app/views/index.jade')
    .pipe($.jade())
    .pipe($.useref.assets({searchPath: '{.tmp/}'}))
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean:dist', function () {
  return gulp.src('dist', {read: false}).pipe($.clean());
});

gulp.task('build', ['clean:dist' ,'html', 'images', 'fonts', 'extras']);

// // // // // // // //

gulp.task('build', ['gulpfile', 'deleteDist', 'copyStatic', 'buildHtml', 'lintClientJs', 'findCssJsFromIndexAndProccess', 'buildServerJs']);

gulp.task('deleteDist', ['gulpfile'], function () {
  return gulp.src('dist', {read: false})
    .pipe($.rimraf());
});

gulp.task('copyStatic', ['gulpfile', 'deleteDist'],  function () {
  gulp.src(['app/.htaccess', 'app/favicon.ico', 'app/robots.txt'])
    .pipe(gulp.dest('dist/public'));

  gulp.src(['package.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('buildHtml', ['gulpfile', 'deleteDist'], function () {
  gulp.src(['app/views/**/*.*', '!app/views/index.html'])
    .pipe(gulp.dest('dist/views'));

  return gulp.src('app/views/index.html')
    .pipe($.useref())
    .pipe(gulp.dest('dist/views'));
});

gulp.task('lintClientJs', ['gulpfile', 'deleteDist'], function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint('.jshintrc')
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail')));
});

gulp.task('buildServerJs', ['gulpfile', 'deleteDist'], function () {
  gulp.src(['lib/**/*.js'])
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe(gulp.dest('dist/lib'));

  gulp.src(['server.js'])
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'))
    .pipe(gulp.dest('dist'));
});