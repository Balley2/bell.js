const gulp = require('gulp');
const argv = require('yargs').argv;
const concat = require('gulp-concat');
const del = require('del');
const debug = require('gulp-debug');
const gulpif = require('gulp-if');
const minify = require('gulp-minify-css');
const uglify = require('gulp-uglify');

// Clean build
gulp.task('clean', function() {
  return del(['static/css', 'static/js']);
});

// Minify css
gulp.task('css', function() {
  var files = [
    'node_modules/bootswatch/simplex/bootstrap.css',
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
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/d3/d3.js',
    'node_modules/cubism/cubism.v1.js',
    'node_modules/nunjucks/browser/nunjucks.js',
    'static/src/js/app.js',
    'static/src/js/util.js',
    'static/src/js/handlers/*.js',
    'static/src/js/controllers/*.js',
  ];
  return gulp.src(files)
    .pipe(debug({title: 'Js:'}))
    .pipe(gulpif(!argv.dev, uglify()))
    .pipe(concat('all.min.js'))
    .pipe(debug({title: 'Js minified:'}))
    .pipe(gulp.dest('static/js'));
});

gulp.task('default', ['css', 'js']);
