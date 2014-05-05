// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
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
    styles: [yeoman.app + '/styles/**/*.styl'],
    test: ['test/client/**/*.js'],
    testRequire: [
      yeoman.app + '/bower_components/angular/angular.js',
      yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
      yeoman.app + '/bower_components/angular-resource/angular-resource.js',
      yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
      yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
      yeoman.app + '/bower_components/angular-route/angular-route.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ]
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

gulp.task('start:server:prod', function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require('./lib/config/config');
  var forever = require('forever');
  forever.startDaemon('./server.js', {options: process.argv});
});

gulp.task('watch', function () {
  var testFiles = paths.client.test.concat(paths.server.test);

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

  $.watch({glob: paths.server.scripts.concat(testFiles)})
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

gulp.task('test:server', function () {
  process.env.NODE_ENV = 'test';
  return gulp.src(paths.server.test)
    .pipe($.mocha({reporter: 'spec'}));
});

gulp.task('test:client', function () {
  var testFiles = paths.client.testRequire.concat(paths.client.test);
  gulp.src(testFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
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
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});

gulp.task('copy:server', function(){
  return gulp.src([
    'package.json',
    'server.js',
    'lib/**/*'
  ], {cwdbase: true}).pipe(gulp.dest(yeoman.dist));
});

// MAILER

var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport('SMTP',{
  host: '127.0.0.1',
  port: 1025
});

var fs = require('fs');
var emailHTML = fs.readFileSync('./test/email_example.html');

var mailOptions = {
  from: 'Pawel Wszola ✔ <wszola.p@gmail.com>', // sender address
  to: 'wszola.p@gmail.com', // list of receivers
  subject: 'Hello ✔', // Subject line
  text: 'Hello world ✔', // plaintext body
  html: emailHTML // html body
};

function sendEmail(cb){
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + response.message);
    }
    cb();
  });
}

gulp.task('email', function(){
  sendEmail();
});

