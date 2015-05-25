/*!
 * gulp
 */

// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    connect = require('gulp-connect'),
    shelljs = require('shelljs'),
    nunjucksRender = require('gulp-nunjucks-render');

// Styles
gulp.task('styles', function() {
  return sass('src/styles/main.scss', { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('dist/styles'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Fonts
gulp.task('fonts', function() {
  return gulp.src('src/fonts/*')
    .pipe(gulp.dest('dist/fonts'));
});

// Templating
gulp.task('layout', function () {
    nunjucksRender.nunjucks.configure(['src/']);
    return gulp.src('src/*.html')
        .pipe(nunjucksRender())
        .pipe(gulp.dest('dist'));
});

// Concat predom
gulp.task('concat-predom', function() {
  return gulp.src([
    'src/vendor/html5shiv/dist/html5shiv.min.js',
    'src/vendor/respond/src/respond.js'
  ])
    .pipe(concat('vendor-predom.js'))
    .pipe(gulp.dest('dist/js'));
});

// Concat postdom
gulp.task('concat-postdom', function() {
  return gulp.src([
    'src/vendor/jquery/dist/jquery.min.js'
  ])
    .pipe(concat('vendor-postdom.js'))
    .pipe(gulp.dest('dist/js'));
});

// Connect
gulp.task('connect', ['layout'], function() {
    connect.server({
        root: 'dist',
        port: 4567
    });
});

// Environ
gulp.task('localhost', function() {
    shelljs.exec('open http://localhost:4567');
});

// Server
gulp.task('server', ['connect', 'styles'], function() {
    gulp.start('localhost');
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img'], cb)
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'js', 'images', 'layout', 'fonts');
});

// Watch
gulp.task('watch', ['server'], function() {

  gulp.start('styles', 'js', 'images', 'fonts', 'layout', 'concat-postdom', 'concat-predom');

  // Watch .scss files
  gulp.watch('src/styles/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('src/js/*.js', ['js', 'concat-postdom', 'concat-predom']);

  // Watch image files
  gulp.watch('src/images/**/*', ['images']);

  // Watch layout files
  gulp.watch(['src/*.html', 'src/**/*.html'], ['layout']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed, connect.reload());

});