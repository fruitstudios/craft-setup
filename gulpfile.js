/*------------------------------------*\
    GULP SETUP
\*------------------------------------*/
const pkg = require('./package.json');

const gulp = require("gulp");

const $ = require('gulp-load-plugins')({
    pattern: ['*'],
    scope: ['devDependencies']
});

// error logging
const onError = (err) => {
    console.log(err);
};

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

gulp.task("css", () => {
    $.fancyLog("-> Compiling css");
    return gulp.src(pkg.paths.tailwind.src)
        .pipe($.plumber({ errorHandler: onError }))
        .pipe($.postcss([
            $.tailwindcss(pkg.paths.tailwind.config),
            require("autoprefixer")
        ]))
        .pipe($.purgecss({
            extractors: [{
                extractor: TailwindExtractor,
                extensions: ["html", "twig", "css", "js"]
            }],
            content: [pkg.paths.build.templates]
        }))
        .pipe($.size({ gzip: true, showFiles: true }))
        .pipe(gulp.dest(pkg.paths.build.css));
});

// Build the css for production (Purge & Minify)
gulp.task("buildcss", () => {
    $.fancyLog("-> Compiling css");
    return gulp.src(pkg.paths.tailwind.src)
        .pipe($.plumber({ errorHandler: onError }))
        .pipe($.postcss([
            $.tailwindcss(pkg.paths.tailwind.config),
            require("autoprefixer")
        ]))
        .pipe($.purgecss({
            extractors: [{
                extractor: TailwindExtractor,
                extensions: ["html", "twig", "css", "js"]
            }],
            content: [pkg.paths.build.templates]
        }))
        .pipe(gulp.dest(pkg.paths.build.css))
        .pipe($.cssnano())
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe($.size({ gzip: true, showFiles: true }))
        .pipe(gulp.dest(pkg.paths.build.css));
});

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
    static extract(content) {
        return content.match(/[A-z0-9-:\/]+/g);
    }
}

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

/*---------------------------------------------------------------*\
    STATIC ASSETS - FIND THE NO IN THE CONFIG AND INCREMENT BY 1
\*---------------------------------------------------------------*/
gulp.task("static-assets-version", () => {
    gulp.src(pkg.paths.craftConfig + "general.php")
        .pipe($.replace(/'staticAssetsVersion' => (\d+),/g, function(match, p1, offset, string) {
            p1++;
            $.fancyLog("-> Changed staticAssetsVersion to " + p1);
            return "'staticAssetsVersion' => " + p1 + ",";
        }))
        .pipe(gulp.dest(pkg.paths.craftConfig));
});

/*------------------------------------*\
    DEFAULT
\*------------------------------------*/
gulp.task('default', ['js', 'css', 'svg', 'images', 'fonts'], function() {
    browserSync.init(['web/build/css/*.css', 'web/build/js/*.js'], {
        proxy: pkg.urls.local,
        https: true
    });

    gulp.watch(['src/css/**/*.css', './tailwind.js'], ['css']);
    gulp.watch(['src/icons/**/*.svg'], ['svg']);
    gulp.watch(['src/images/**/*'], ['images']);
    gulp.watch(['src/fonts/**/*'], ['fonts']);
    gulp.watch(['src/js/**/*.js'], ['js']);
    gulp.watch(['templates/**/*.twig'], function() {
        browserSync.reload();
    });
});

/*------------------------------------*\
    BUILD TASK
\*------------------------------------*/
gulp.task("build", ["buildcss", "static-assets-version"]);
