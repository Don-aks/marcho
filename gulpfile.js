const {src, dest, watch, parallel, series} = require('gulp');

const sass          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const autoprefixer  = require('gulp-autoprefixer');
const uglify        = require('gulp-uglify');
const imagemin      = require('gulp-imagemin');
const del           = require('del');
const browserSync   = require('browser-sync').create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'src/'
    },
    notify: false
  })
}

function styles() {
  return src('src/sass/style.sass')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('src/css/'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src(['src/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('src/js'))
    .pipe(browserSync.stream())
}

function images() {
  return src('src/img/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/img'))
}

function build() {
  return src([
      'src/**/*.html',
      'src/css/style.min.css',
      'src/js/main.min.js'
    ], {base: 'src'})
    .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist');
}

function watching() {
  watch(['src/sass/**/*.sass'], styles);
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts);
  watch(['src/**/*.html']).on('change', browserSync.reload)
}

exports.styles      = styles;
exports.scripts     = scripts;
exports.browsersync = browsersync;
exports.watching    = watching;
exports.images      = images;
exports.cleanDist   = cleanDist;
exports.build       = series(cleanDist, images, build);

exports.default  = parallel(styles, scripts, browsersync, watching);