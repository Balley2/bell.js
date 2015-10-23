const gulp = require('gulp');
const concat = require('gulp-concat');
const del = require('del');
const debug = require('gulp-debug');
const minify = require('gulp-minify-css');
const uglify = require('gulp-uglify');

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
    .pipe(debug({title: 'Css:'}))
    .pipe(minify())
    .pipe(concat('all.min.css'))
    .pipe(debug({title: 'Css minified:'}))
    .pipe(gulp.dest('static/css'));
});

// Minify js
gulp.task('js', function() {
  var files = [
    'static/lib/jquery/dist/jquery.js',
    'static/lib/bootstrap/dist/js/bootstrap.js',
    'static/lib/d3/d3.js',
    'static/lib/cubism/cubism.v1.js',
    'static/lib/mustache.js/mustache.js',
    'static/src/js/app.js',
    'static/src/js/util.js',
    'static/src/js/handlers/*.js',
    'static/src/js/controllers/*.js',
  ];
  return gulp.src(files)
    .pipe(debug({title: 'Js:'}))
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(debug({title: 'Js minified:'}))
    .pipe(gulp.dest('static/js'));
});

gulp.task('default', ['css', 'js']);
