'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var uglify = require('gulp-uglifyjs');
/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('uglify', function() {
  gulp.src('app/**.js')
    .pipe(uglify('Backbone.Validater.min.js'))
    .pipe(gulp.dest('dist'))
});