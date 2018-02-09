/*------------------------------------*\
    GULP SETUP
\*------------------------------------*/
var gulp = require('gulp');

const pkg = require('./package.json');
const $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});
browserSync = require('browser-sync').create()


/*------------------------------------*\
    SCSS TASKS
\*------------------------------------*/
var sassOptions = {
    autoprefixer: {
        browsers: ['last 2 versions'],
        cascade: false
    }
};

gulp.task("scss", function() {

    gulp.src(pkg.paths.src.styles)
        .pipe($.plumber())
        .pipe($.sass())
        .pipe($.autoprefixer(sassOptions.autoprefixer))
        .pipe(gulp.dest(pkg.paths.build.styles))
        .pipe($.cssnano())
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(pkg.paths.build.styles));
});

/*------------------------------------*\
    JS TASKS
\*------------------------------------*/
gulp.task('js', function() {

    gulp.src(pkg.paths.src.js)
        .pipe($.plumber())
        .pipe($.concat('app.js'))
        .pipe(gulp.dest(pkg.paths.build.js))
        .pipe($.uglify())
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(pkg.paths.build.js));
});

/*------------------------------------------*\
    SVG TASKS - OPTIMISE & REMOVE FILLS
\*------------------------------------------*/
gulp.task('svg', function() {

    gulp.src(pkg.paths.src.svgs)
        .pipe($.imagemin())
        .pipe($.cheerio({
            run: function($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe($.svgSymbols({
            fill: false,
            className: '.icon-%f',
        }))
        .pipe(gulp.dest(pkg.paths.build.svgs));

});

/*------------------------------------*\
    IMAGES - OPTIMISE AND MINIFY
\*------------------------------------*/
gulp.task('images', function() {

    gulp.src(pkg.paths.src.images)
        .pipe($.imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(pkg.paths.build.images));

});

/*------------------------------------*\
    FONTS - MOVE TO BUILD FOLDER
\*------------------------------------*/
gulp.task('fonts', function() {

    gulp.src(pkg.paths.src.fonts)
        .pipe(gulp.dest(pkg.paths.build.fonts));

});

/*------------------------------------*\
    DEFAULT
\*------------------------------------*/
gulp.task('default', ['js', 'scss', 'svg', 'images', 'fonts'], function() {
    browserSync.init(['web/build/css/*.css', 'web/build/js/*.js'], {
        proxy: pkg.urls.local,
        https: true
    });

    gulp.watch(['src/**/*.scss'], ['scss']);
    gulp.watch(['src/icons/**/*.svg'], ['svg']);
    gulp.watch(['src/images/**/*'], ['images']);
    gulp.watch(['src/fonts/**/*'], ['fonts']);
    gulp.watch(['src/js/**/*.js'], ['js']);
    gulp.watch(['templates/**/*.twig'], function() {
        browserSync.reload();
    });
});
