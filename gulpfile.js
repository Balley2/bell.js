const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minify = require('gulp-minify-css');
const del = require('del');

// Clean build
gulp.task('clean', function() {
  return del(['static/css', 'static/js']);
});

// Minify css
gulp.task('css', function() {
  var files = [
    'static/lib/bootstrap/dist/css/bootstrap.css',
    'static/src/css/*.css',
  ];
  return gulp.src(files)
    .pipe(minify())
    .pipe(concat('all.min.css'))
    .pipe(gulp.dest('static/css'));
});

// Minify js
gulp.task('js', function() {
  var files = [
    'static/lib/jquery/jquery.js',
    'static/lib/bootstrap/dist/js/bootstrap.js',
    'static/lib/d3/d3.js',
    'static/lib/cubism/cubism.v1.js',
    'static/src/js/*.js',
  ];
  return gulp.src(files)
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('static/js'));
});

gulp.task('default', ['css', 'js']);
