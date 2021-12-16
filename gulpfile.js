const { src, dest, watch, parallel, series }  = require('gulp');

const scss          = require('gulp-sass');
const concat        = require('gulp-concat');
const fileinclude   = require('gulp-file-include');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const svgSprite     = require('gulp-svg-sprite');
const imageminWebp  = require('imagemin-webp');
const del           = require('del');
const ttf2woff      = require('gulp-ttf2woff');
const ttf2woff2     = require('gulp-ttf2woff2');

function browsersync() {
  browserSync.init({
    server : {
      baseDir: 'dist'
    },
  });
}

function fonts() {
  return src([
    'app/fonts/**/*'
  ])
    .pipe(dest('dist/fonts'))
    .pipe(browserSync.stream())
}

const htmlInclude = () => {
  return src(['app/*.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

//svg sprite
const svgSprites = () => {
  return src('./app/images/icons/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg" //sprite file name
        },
        css: { // Activate the «css» mode
          render: {
            css: true // Activate CSS output 
          }
        }
      },
    }))
    .pipe(dest('./dist/images/icons'))
    .pipe(browserSync.stream());
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/images/**/*')
    .pipe(imagemin(
      [
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
          ]
        })
      ]
    ))
    .pipe(dest('dist/images'))
}

function scripts() {
  return src([
    // 'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/style.scss')
      .pipe(scss({outputStyle: 'compressed'}))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true
      })) 
      .pipe(dest('dist/css'))
      .pipe(browserSync.stream())
}

function build() {
  return src([
    'app/css/style.min.css',
    'app/fonts/**/*',
    'app/js/main.min.js',
    'app/*.html'
  ], {base: 'app'})
      .pipe(dest('dist'))
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/*.html'], htmlInclude);
  watch(['app/images/icons/**.svg'], svgSprites);
}

// htmlInclude

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.fonts = fonts;
exports.htmlInclude = htmlInclude;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, svgSprites, htmlInclude, fonts, build);
exports.default = parallel(styles ,scripts, svgSprites, htmlInclude, watching, browsersync);


