(function (gulp, gulpLoadPlugins, undefined) {
    'use strict';


    var $ = gulpLoadPlugins({ pattern: '*', lazy: true }),
        _ = { src: 'src', dist: 'dist', vendor: 'src/vendor', tmp: '.tmp', tmpBuild: '.tmp-build'};
        // path = require('path');

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ jsonlint
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('jsonlint', function() {
        return gulp.src([
            'package.json',
            'bower.json',
            _.src + '/manifest.json',
            '.bowerrc',
            '.jshintrc',
            '.jscs.json'
        ])
        .pipe($.plumber())
        .pipe($.jsonlint()).pipe($.jsonlint.reporter())
        .pipe($.notify({
            message: '<%= options.date %> ✓ jsonlint: <%= file.relative %>',
            templateOptions: {
                date: new Date()
            }
        }));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ jshint
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('jshint', function() {
        return gulp.src([
            'gulpfile.js',
            _.src + '/js/**/*.js',
            '!' + _.src + '/vendor/**/*.js',
            'test/spec/{,*/}*.js'
        ])
        .pipe($.plumber())
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('default'))
        // .pipe($.jscs())
        .pipe($.notify({
            message: '<%= options.date %> ✓ jshint: <%= file.relative %>',
            templateOptions: {
                date: new Date()
            }
        }));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ styles
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('styles', function() {
        return $.rubySass(_.src + '/scss/', {
                sourcemap: true
            })
            .on('error', $.util.log)
            .pipe(gulp.dest(_.src + '/css'))
            .pipe($.notify({
                message: '<%= options.date %> ✓ styles: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });

    gulp.task('styles-build', function() {
        return $.rubySass(_.src + '/scss/', {
                sourcemap: false,
                style: 'compressed'
            })
            .on('error', $.util.log)
            .pipe(gulp.dest(_.dist + '/css'))
            .pipe($.notify({
                message: '<%= options.date %> ✓ styles: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ js
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('js-build', function() {
        return gulp.src(
              _.src + '/js/main.js'
          )
          .pipe($.jshint('.jshintrc'))
          .pipe($.jshint.reporter('default'))
          .on('error', $.util.log)
          .pipe(gulp.dest(_.dist + '/js'))
          .pipe($.uglify())
          .pipe(gulp.dest(_.dist + '/js'))
          .pipe($.notify({ message: 'Scripts task complete' }));
    });


    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ svg
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('svg', function() {
        return gulp.src([
            _.src + '/img/**/*.svg',
            _.src + '/css/**/*.svg'
        ])
        .pipe($.plumber())
        .pipe($.svgmin([{ removeDoctype: false }, { removeComments: false }]))
        .pipe(gulp.dest(_.dist + '/img')).pipe($.size()).pipe($.notify({
            message: '<%= options.date %> ✓ svg: <%= file.relative %>',
            templateOptions: {
                date: new Date()
            }
        }));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ fonts
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('fonts', function() {
        return gulp.src([
            _.src + '/fonts/*'
        ])
        .pipe($.plumber())
        .pipe(gulp.dest(_.dist + '/fonts'))
        .pipe($.size()).pipe($.notify({
            message: '<%= options.date %> ✓ copy: <%= file.relative %>',
            templateOptions: {
                date: new Date()
            }
        }));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ img
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('img', function() {
        return gulp.src([
            _.src + '/img/**/*.{png,jpg,jpeg,gif,ico}'
        ]).pipe($.plumber())
        .pipe(
            //$.cache(
                $.imagemin({
                    optimizationLevel: 3,
                    progressive: true,
                    interlaced: true
                })
            //)
        )
        .pipe(gulp.dest(_.dist + '/img')).pipe($.size()).pipe($.notify({
            message: '<%= options.date %> ✓ img: <%= file.relative %>',
            templateOptions: {
                date: new Date()
            }
        }));
    });


    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ html
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('useref', ['jshint'], function() {

        var assets = $.useref.assets();

        return gulp
            .src([_.src + '/layouts/**/*.html'])
            .pipe($.plumber())
            .pipe(assets)
            .pipe($.if('*predom.js', $.uglify()))
            .pipe($.if('*postdom.js', $.uglify()))
            .pipe($.if('*main.js', $.uglify()))
            .pipe(assets.restore())
            .pipe($.useref())
            .pipe($.if('*.js', gulp.dest(_.tmpBuild))) // this is a little whacky because the js has a rel path so its writing to _.tmpBuild + '/js/../js/predom.js'
            .pipe($.if('*.html', gulp.dest(_.tmpBuild + '/layouts')))
            .pipe($.size())
            .pipe($.notify({
                message: '<%= options.date %> ✓ html: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });

    gulp.task('src-to-tmp-build', function() {

        return gulp
            .src([
                _.src + '/**/*.html',
                '!' + _.src + '/layouts/*.html',
                '!' + _.src + '/vendor/**/*.html'
            ])
            .pipe(gulp.dest(_.tmpBuild))
            .pipe($.size())
            .pipe($.notify({
                message: '<%= options.date %> ✓ src-to-tmp-build: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });

    gulp.task('tmp-build-to-dist', ['layout-build'], function() {

        return gulp
            .src([
                _.tmpBuild + '/js/*'
            ])
            .pipe($.uglify())
            .pipe(gulp.dest(_.dist + '/js'))
            .pipe($.size())
            .pipe($.notify({
                message: '<%= options.date %> ✓ tmp-build-to-dist: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ layout
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('layout', function () {
        $.nunjucksRender.nunjucks.configure([_.src]);

        return gulp.src([
                _.src + '/**/*.html',
                '!' + _.src + '/layouts/**/*.html',
                '!' + _.src + '/pages/_templates/**/*.html',
                '!' + _.src + '/vendor/**/*.html'
            ])
            .pipe($.nunjucksRender())
            .pipe(gulp.dest(_.tmp))
            .pipe($.notify({
                message: '<%= options.date %> ✓ layout: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });

    gulp.task('layout-build', ['useref', 'src-to-tmp-build'], function () {

        // hack - because this task never finishes - even when it finishe...
        gulp.on('stop', function () {
            process.nextTick(function () {
                process.exit(0);
            });
        });

        $.nunjucksRender.nunjucks.configure([_.tmpBuild]);

        return gulp.src([
                _.src + '/**/*.html',
                '!' + _.src + '/layouts/**/*.html',
                '!' + _.src + '/vendor/**/*.html',
                '!' + _.src + '/pages/_templates/**/*.html',
                '!' + _.src + '/macros/**/*.html'
            ])
            .pipe($.nunjucksRender())
            .pipe(gulp.dest(_.dist))
            .pipe($.size())
            .pipe($.notify({
                message: '<%= options.date %> ✓ layout-build: <%= file.relative %>',
                templateOptions: {
                    date: new Date()
                }
            }));
    });


    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ bower (Inject Bower components)
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('wiredep', function() {
        gulp.src(_.src + '/css/*.{sass,scss}').pipe($.wiredep.stream({
            directory: _.src + '/vendor',
            ignorePath: _.src + '/vendor/'
        })).pipe(gulp.dest(_.src + '/css'));
        gulp.src(_.src + '/*.html').pipe($.wiredep.stream({
            directory: _.src + '/vendor',
            ignorePath: _.src + '/'
        })).pipe(gulp.dest(_.src));
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ connect
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('connect', ['layout'], function() {
        $.connect.server({
            root: [_.tmp, _.src],
            livereload: true,
            port: 8000
        });
    });


    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ server
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('server', ['connect', 'styles'], function() {
        gulp.start('localhost');
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ watch
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('watch', ['server'], function() {

        // Live Reload
        $.watch([
            _.src + '/*.{html,txt}',
            _.src + '/scss/*',
            _.src + '/js/**/*.js',
            _.src + '/img/**/*.{png,jpg,jpeg,gif,ico}',
            '!' + _.src + '/vendor/**/*.js'
        ], function(files) {
            return files.pipe($.plumber()).pipe($.connect.reload());
        });

        // Watch html files
        $.watch([_.src + '/**/*.html'], function() {
            gulp.start('layout');
        });

        // Watch style files
        $.watch([
            _.src + '/scss/**/*'
        ], function() {
            gulp.start('styles');
        });

        // Watch bower files
        $.watch('bower.json', function() {
            gulp.start('wiredep');
        });
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ clean
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('clean-dist', function (cb) {
        return $.del([
            _.dist + '/**/*',
            _.tmp + '/**/*',
            _.tmpBuild + '/**/*',
        ], cb);
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ environ
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('localhost', function() {
        $.shelljs.exec('open http://localhost:8000');
    });
    gulp.task('prod', function() {
        $.shelljs.exec('open https://www.npmjs.org/package/generator-gulp-requirejs');
    });
    gulp.task('dev', function() {
        $.shelljs.exec('open http://www.npmjs.org/package/generator-gulp-requirejs');
    });
    gulp.task('hml', function() {
        $.shelljs.exec('open https://www.npmjs.org/package/generator-gulp-requirejs');
    });

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ alias
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('clean', ['clean-dist']);
    gulp.task('test', ['jsonlint', 'jshint']);
    gulp.task('build', ['test', 'tmp-build-to-dist', 'styles-build', 'js-build', 'img', 'svg', 'fonts']);

    //|**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //| ✓ default
    //'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    gulp.task('default', function() {
        gulp.start('build');
    });

}(require('gulp-param')(require('gulp'), process.argv), require('gulp-load-plugins')));
