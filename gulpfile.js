'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var http = require('http');
var openURL = require('open');
var lazypipe = require('lazypipe');
var wiredep = require('wiredep').stream;
var nodemon = require('nodemon');
var runSequence = require('run-sequence');
var nib = require('nib');
var config;

var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: 'dist'
};

var paths = {
  client: {
    scripts: [yeoman.app + '/scripts/**/*.js'],
    styles: [yeoman.app + '/styles/**/*.styl']
  },
  server: {
    scripts: ['lib/**/*.js'],
    test: ['test/server/**/*.js']
  },
  views: {
    main: yeoman.app + '/views/index.jade',
    files: [yeoman.app + '/views/**/*.jade']
  },
  karma: 'karma.conf.js'
};

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

// Call page until first success
function whenServerReady (cb) {
  var serverReady = false;
  var appReadyInterval = setInterval(function () {
    checkAppReady(function(ready) {
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

var lintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
  .pipe($.stylus, {
    use: [nib()],
    errors: true
  })
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////

gulp.task('styles', function () {
  return gulp.src(paths.client.styles)
    .pipe(styles());
});

gulp.task('lint:scripts', function () {
  var scripts = paths.client.scripts.concat(paths.server.scripts);
  return gulp.src(scripts).pipe(lintScripts());
});

gulp.task('clean:tmp', function () {
  return gulp.src('.tmp', {read: false}).pipe($.clean());
});

gulp.task('start:client', ['styles'], function (callback) {
  whenServerReady(function () {
    openURL('http://localhost:' + config.port);
    callback();
  });
});

gulp.task('start:server', function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require('./lib/config/config');
  nodemon('-w lib server.js')
    .on('log', onServerLog);
});

gulp.task('watch', function () {
  $.watch({glob: paths.client.styles})
    .pipe($.plumber())
    .pipe(styles())
    .pipe($.livereload());

  $.watch({glob: paths.views.files})
    .pipe($.plumber())
    .pipe($.livereload());

  $.watch({glob: paths.client.scripts})
    .pipe($.plumber())
    .pipe(lintScripts())
    .pipe($.livereload());

  $.watch({glob: paths.server.scripts.concat(paths.server.test)})
    .pipe($.plumber())
    .pipe(lintScripts());

  gulp.watch('bower.json', ['bower']);
});

gulp.task('serve', function (callback) {
  runSequence('clean:tmp',
    ['lint:scripts'],
    ['start:server', 'start:client'],
    'watch', callback);
});

gulp.task('serve:prod', function (callback) {
  runSequence('clean:tmp',
    ['start:server:prod', 'start:client'],
    callback);
});

// inject bower components
gulp.task('bower', function () {
  return gulp.src(paths.views.main)
    .pipe(wiredep({
      directory: yeoman.app + '/bower_components',
      ignorePath: '..'
    }))
  .pipe(gulp.dest(yeoman.app + '/views/'));
});

///////////
// Build //
///////////

gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['images', 'copy:extras', 'copy:fonts', 'copy:server', 'client:build'],
    callback);
});

gulp.task('clean:dist', function () {
  return gulp.src('dist', {read: false}).pipe($.clean());
});

gulp.task('client:build', ['html'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets = $.filter('**/*.{js,css}');

  return gulp.src(paths.views.main)
    .pipe($.jade({pretty: true}))
    .pipe($.useref.assets({searchPath: [yeoman.app, '.tmp']}))
    .pipe(jsFilter)
    .pipe($.ngmin())
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))
    .pipe(cssFilter.restore())
    .pipe($.rev())
    .pipe($.useref.restore())
    .pipe($.revReplace())
    .pipe($.useref())
    .pipe(assets)
    .pipe(gulp.dest(yeoman.dist + '/public'));
});

gulp.task('html', function () {
  return gulp.src(yeoman.app + '/views/**/*')
    .pipe(gulp.dest(yeoman.dist + '/public/views'));
});

gulp.task('images', function () {
  return gulp.src(yeoman.app + '/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(yeoman.dist + '/public/images'));
});

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist + '/public'));
});

gulp.task('copy:fonts', function () {
  return gulp.src(yeoman.app + '/styles/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/public/styles/fonts'));
});

gulp.task('copy:server', function() {
  return gulp.src([
    'server.js',
    'lib/**/*'
  ], {cwdbase: true}).pipe(gulp.dest(yeoman.dist));
});