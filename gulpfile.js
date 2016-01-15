// Modules
var autoprefix = require('gulp-autoprefixer'),
    changed = require('gulp-changed'),
    concat = require('gulp-concat'),
    del = require('del'),
    expect = require('gulp-expect-file'),
    gulp = require('gulp'),
    gutil = require('gutil'),
    header = require('gulp-header'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    cssnano = require('gulp-cssnano'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    scss = require('gulp-sass'),
    scsslint = require('gulp-scss-lint'),
    sourcemaps = require('gulp-sourcemaps'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify');

// Config
var banner = '/*! Project Name | www.lab66.io | Copyright (c) 2016 */\n',
    resources = {
        components: {
            fonts: 'bower_components/font-awesome/fonts/**/*.{eot,otf,svg,ttf,woff,woff2}',
            scripts: [
                'bower_components/jquery/dist/jquery.min.js',
                'bower_components/bootstrap/dist/js/bootstrap.min.js'
            ],
            styles: [
                'bower_components/bootstrap/dist/css/bootstrap.min.css',
                'bower_components/font-awesome/css/font-awesome.min.css'
            ]
        },
        images: 'resources/images/**/*.{png,jpg,jpeg,gif}',
        scripts: ['resources/scripts/**/*.js'],
        styles: ['resources/styles/**/*.scss'],
        views: '**/*.php'
    },
    options = {
        autoprefix: 'last 3 version',
        imagemin: {optimizationLevel: 3, progressive: true, interlaced: true},
        jshint: '',
        jshint_reporter: 'stylish',
        plumber: {errorHandler: onError},
        rename: {suffix: '.min'},
        scss: {},
        scsslint: {config: '.scss-lint.yml', maxBuffer: 524288},
        uglify: {mangle: true}
    };

var onError = function(err) {
    gutil.beep();
    console.log(err);
};

// Tasks
gulp.task('clean', function (callback) {
    return del(['assets'], callback);
});

gulp.task('components:fonts', function () {
    return gulp.src(resources.components.fonts)
        .pipe(gulp.dest('assets/fonts'));
});

gulp.task('components:scripts', function () {
    return gulp.src(resources.components.scripts)
        .pipe(plumber(options.plumber))
        .pipe(expect(resources.components.scripts))
        .pipe(gulp.dest('assets/js'))
        .pipe(concat('components.min.js'))
        .pipe(uglify(options.uglify))
        .pipe(plumber.stop())
        .pipe(gulp.dest('assets/js'));
});

gulp.task('components:styles', function () {
    return gulp.src(resources.components.styles)
        .pipe(expect(resources.components.styles))
        .pipe(gulp.dest('assets/css'))
        .pipe(concat('components.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('assets/css'));
});

gulp.task('images', function () {
    return gulp.src(resources.images)
        .pipe(changed('assets/img'))
        .pipe(plumber(options.plumber))
        .pipe(imagemin(options.imagemin))
        .pipe(plumber.stop())
        .pipe(gulp.dest('assets/img'));
});

gulp.task('scripts', function () {
    return gulp.src(resources.scripts)
        .pipe(plumber(options.plumber))
        .pipe(sourcemaps.init())
        .pipe(expect(resources.scripts))
        .pipe(jshint(options.jshint))
        .pipe(jshint.reporter(stylish))
        .pipe(gulp.dest('assets/js'))
        .pipe(concat('scripts.min.js'))
        .pipe(uglify(options.uglify))
        .pipe(header(banner))
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('assets/js'));
});

gulp.task('styles', function () {
    return gulp.src(resources.styles)
        .pipe(plumber(options.plumber))
        .pipe(sourcemaps.init())
        .pipe(scss(options.scss))
        .pipe(autoprefix(options.autoprefix))
        .pipe(header(banner))
        .pipe(gulp.dest('assets/css'))
        .pipe(cssnano())
        .pipe(rename(options.rename))
        .pipe(header(banner))
        .pipe(sourcemaps.write('.'))
        .pipe(plumber.stop())
        .pipe(gulp.dest('assets/css'))
        .pipe(livereload());
});

gulp.task('styles:lint', function() {
    return gulp.src(resources.styles)
        .pipe(scsslint(options.scsslint));
});

gulp.task('watch', function () {
    livereload.listen(35729);
    gulp.watch(resources.images, ['images']).on('change', livereload.changed);
    gulp.watch(resources.scripts, ['scripts']).on('change', livereload.changed);
    gulp.watch(resources.styles, ['styles']);
    gulp.watch(resources.views).on('change', livereload.changed);
});

gulp.task('default', ['clean'], function() {
    return gulp.start(
        'components:fonts',
        'components:scripts',
        'components:styles',
        'images',
        'scripts',
        'styles',
        'styles:lint',
        'watch'
    );
});