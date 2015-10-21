const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minify = require('gulp-minify-css');
const del = require('del');

// Clean dist
gulp.task('clean', function() {
  return del(['web/dist']);
});

// Minify css
gulp.task('css', function() {
  return gulp.src(['web/css/*.css'])
    .pipe(minify())
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest('web/dist/css'));
});

// Minify js
gulp.task('js', function() {
  return gulp.src(['web/js/*.js'])
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('web/dist/js'));
});

// Minify vendor css
gulp.task('vendor css', function() {
  return gulp.src(['web/vendor/bootstrap/dist/css/bootstrap.css'])
    .pipe(minify())
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('web/dist/css'));
});

// Minify vendor js
gulp.task('vendor js', function() {
  return gulp.src(['web/vendor/jquery/jquery.js',
                  'web/vendor/angular/angular.js',
                  'web/vendor/bootstrap/dist/js/bootstrap.js'])
    .pipe(uglify())
    .pipe(concat('vendors.min.js'))
    .pipe(gulp.dest('web/dist/js'));
});

gulp.task('default', ['css', 'js', 'vendor css', 'vendor js']);
