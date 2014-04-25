'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var http = require('http');
var openURL = require('open');
var lazypipe = require('lazypipe');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./lib/config/config');

//////////////////////
// Helper functions //
//////////////////////
function onServerLog(log) {
  console.log(plugins.util.colors.white('[') + plugins.util.colors.yellow('nodemon') + plugins.util.colors.white('] ') + log.message);
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
  .pipe(plugins.jshint('.jshintrc'))
  .pipe(plugins.jshint.reporter, 'jshint-stylish');

/////////
// CSS //
/////////

gulp.task('clean:css', function () {
  return gulp.src('.tmp/styles', {read: false})
    .pipe(plugins.clean());
});

gulp.task('styles', ['clean:css'], function () {
  return gulp.src('app/styles/**/*.scss')
    .pipe(plugins.sass({
      includePaths: ['app/bower_components'],
      errLogToConsole: true
    }))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(plugins.livereload());
});


/////////////
// Linting //
/////////////

gulp.task('lint', ['jshint:gulp', 'jshint:server', 'jshint:client']);

gulp.task('jshint:gulp', function () {
  return gulp.src(['./Gulpfile.js']).pipe(jshint());
});

gulp.task('jshint:client', function () {
  return gulp.src(['app/scripts/**/*.js']).pipe(jshint());
});

gulp.task('jshint:server', function () {
  return gulp.src([
    'lib/**/*.js',
    'server.js',
  ]).pipe(jshint);
});

///////////
// Start //
///////////

gulp.task('start:client', ['start:server', 'jshint:client', 'styles'], function () {
  openURL('http://localhost:' + config.port);
});

gulp.task('start:server', ['jshint:server'], function (callback) {
  plugins.nodemon({
    script: 'server.js',
    watch: ['lib', 'server.js']
  })
  .on('log', onServerLog);
  whenServerReady(callback);
});

gulp.task('watch', function () {
  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/views/**/*.html', function (event) {
    gulp.src(event.path)
      .pipe(plugins.livereload());
  });
  gulp.watch('app/scripts/**/*.js', function (event) {
    gulp.src(event.path)
      .pipe(plugins.jshint('.jshintrc'))
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.livereload());
  });
});

gulp.task('serve', ['styles', 'lint', 'start:server', 'start:client', 'watch']);