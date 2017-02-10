'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat-multi'),
    browserSync = require('browser-sync'),
    sourcemaps = require('gulp-sourcemaps'),
    bower = require('main-bower-files'),
    babel = require('gulp-babel');

// Load plugins
var $ = require('gulp-load-plugins')({
    rename: {
            'gulp-ruby-sass': 'sass'
        }
    });


gulp.task('scss', function(){
    var browsers = [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'Opera 12.1'
    ];

    return gulp.src(['src/**/*.scss'])
        .pipe($.sass({
            style: 'expanded'
        })
        .on('error', $.util.log))
        .pipe($.postcss([
            require('autoprefixer-core')({
                browsers: browsers
            })
        ]))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('less', function() {
    var browsers = [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'Opera 12.1'
    ];

    return gulp.src([
            'node_modules/bootstrap/less/bootstrap.less',
            'node_modules/bootstrap-multiselect/dist/less/bootstrap-multiselect.less',
            'src/**/*.less'
        ])
        .pipe($.less({
            paths: ['bower_components']
        })
        .on('error', $.util.log))
        .pipe($.postcss([
                require('autoprefixer-core')({
                    browsers: browsers
                })
            ]))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({stream: true}));
    })

gulp.task('styles', ['scss', 'less']);


gulp.task('views', function(){
    return gulp.src([
            '!src/views/layout.jade',
            'src/views/*.jade'
        ])
        .pipe($.jade({
            pretty: true
        }))
        .on('error', $.util.log)
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe($.imagemin({
            svgoPlugins: [{
                convertPathData: false
            }]
        }))
        .pipe(gulp.dest('build/images'));
});

gulp.task('copyFonts', function() {
    return gulp.src('node_modules/bootstrap/fonts/**/*')
        .pipe(gulp.dest('build/fonts'));
})

gulp.task('scripts', function() {
    return concat({
        "libraries.js": [
            'node_modules/babel-polyfill/dist/polyfill.js',
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/jquery-flot/jquery.flot.js',
            'node_modules/jquery-flot/jquery.flot.time.js',
            'node_modules/jquery-flot/jquery.flot.symbol.js',
            'node_modules/jquery-flot/jquery.flot.selection.js',
            'node_modules/bootstrap-multiselect/dist/js/bootstrap-multiselect.js',
            'node_modules/bootstrap-multiselect/dist/js/bootstrap-multiselect-collapsible-groups.js',
            'node_modules/bootstrap/js/dropdown.js',
            'node_modules/oboe/dist/oboe-browser.min.js'
        ],
        "boot.js": 'src/boot.js',
        "app.js": [
            'src/js/**/*.js',
        ],
        "graphs.js": [
            'src/js-graphs/**/*.js',
        ],
        "vendor.js": [].concat(
            ['src/vendor/**/*.js'],
            bower()
        )
    })
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015', 'stage-0']
        }))
        .pipe(sourcemaps.write('.'))
        .on('error', $.util.log)
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.reload({stream: true}))
});


gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './build'
        }
    });
});


gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*.less', ['styles']);
    gulp.watch('src/images/**/*', ['images']);
    gulp.watch('src/**/*.jade', ['views']);
    gulp.watch('src/**/*.js', ['scripts']);

    gulp.start('browser-sync');
});

// JSHint grunfile.js
gulp.task('selfcheck', function() {
    return gulp.src('gulpfile.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'))
        .pipe($.jshint.reporter('fail'));
});


gulp.task('clean', function(cb) {
    var del = require('del');
    del(['build'], cb);
});


gulp.task('build', ['styles', 'views', 'images', 'scripts', 'copyFonts']);


gulp.task('default', ['clean'], function() {
    gulp.start('watch');
});
