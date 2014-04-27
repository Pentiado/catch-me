'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var http = require('http');
var openURL = require('open');
var lazypipe = require('lazypipe');
var wiredep = require('wiredep').stream;
var nodemon = require('nodemon');
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
  .pipe(gulp.dest, './.tmp/styles');

  // src .less
  // .pipe($.less({
  //   paths: [ path.join(__dirname, 'less', 'includes') ]
  // }))

  // src .styl
  // .pipe($.stylus, {use: [nib()], errors: true})

/////////
// CSS //
/////////

gulp.task('styles', function () {
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


gulp.task('clean', function () {
  return gulp.src('.tmp', {read: false}).pipe($.clean());
});

gulp.task('start:client', ['styles'], function () {
  whenServerReady(function () {
    openURL('http://localhost:' + config.port);
  });
});

gulp.task('start:server', ['lint:server'], function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require('./lib/config/config');
  nodemon('-w lib server.js')
    .on('log', onServerLog);
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

gulp.task('serve', ['clean', 'lint', 'start:server', 'start:client', 'watch']);

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
      exclude: ['bootstrap-sass-official'],
      ignorePath: '..'
    }))
  .pipe(gulp.dest('app/views/'));
});

///////////
// Build //
///////////

gulp.task('build', ['clean:dist', 'images', 'extras', 'html', 'client:build']);

gulp.task('client:build', ['clean:dist'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets = $.filter('**/*.{js,css}');

  return gulp.src('app/views/index.jade')
    .pipe($.jade({pretty: true}))
    .pipe($.useref.assets({searchPath: ['./app/', './.tmp/']}))
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe($.rev())
    .pipe($.useref.restore())
    .pipe($.revReplace())
    .pipe($.useref())
    .pipe(assets)
    .pipe(gulp.dest('dist/app'));
});

gulp.task('html', function () {
  return gulp.src('app/views/**/*')
    .pipe(gulp.dest('dist/views'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('dist/public/images'));
});

gulp.task('extras', function () {
  return gulp.src('app/*.*', { dot: true })
    .pipe(gulp.dest('dist/public'));
});

gulp.task('clean:dist', function () {
  return gulp.src('dist', {read: false}).pipe($.clean());
});

gulp.task('copy:server', ['clean:dist'], function(){
  return gulp.src([
    'package.json',
    'server.js',
    'lib/**/*'
  ], {cwdbase: true}).pipe(gulp.dest('dist'));
});
