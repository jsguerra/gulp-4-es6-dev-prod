// Set Gulp variables
const { src, dest, watch, series, parallel } = require('gulp');

// CSS related plugins
const sass = require('gulp-dart-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      csso = require('gulp-csso');

// JS related plugins
const babel = require('gulp-babel'),
      terser = require('gulp-terser'),
      webpack = require('webpack-stream');

// Utility plugins
const del = require('del'),
      rename = require('gulp-rename'),
      imagemin = require('gulp-imagemin'),
      sourcemaps = require('gulp-sourcemaps'),
      mode = require('gulp-mode')();

// Set browser sync variable
const browserSync = require('browser-sync').create();

// File paths
const scssSrc = './src/scss/',
      jsSrc = './src/js/',
      imgSrc = './src/images/',
      fontSrc = './src/fonts/',
      app = './app';

// Watch files
const styleWatch = scssSrc + '**/*.scss',
      jsWatch = jsSrc + '**/*.js',
      imgWatch = imgSrc + '**/*.{png,jpg,jpeg,gif,svg}',
      fontsWatch = fontSrc + '**/*.{svg,eot,ttf,woff,woff2}',
      htmlWatch = './src/**/*.html';

// clean tasks
const clean = () => {
  return del(['app']);
}

const cleanImages = () => {
  return del(['app/images']);
}

const cleanFonts = () => {
  return del(['app/fonts']);
}

// CSS Task
const cssTask = () => {
  return src(scssSrc + 'main.scss')
    .pipe(mode.development( sourcemaps.init() ))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('style.css'))
    .pipe(mode.production( csso() ))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest(app + '/css/'))
    .pipe(mode.development( browserSync.stream())
  );
}

// Javascript Task
const jsTask = () => {
  return src(jsSrc + 'index.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(webpack({
      mode: 'development',
      devtool: 'inline-source-map'
    }))
    .pipe(mode.development( sourcemaps.init({ loadMaps: true }) ))
    .pipe(rename('app.js'))
    .pipe(mode.production( terser({ output: { comments: false }}) ))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest(app + '/js/'))
    .pipe(mode.development( browserSync.stream() )
  );
}

// Image Task
const imageTask = () => {
  return src(imgWatch)
    .pipe(imagemin())
    .pipe(dest(app + '/images/')
  );
}

// Fonts Task
const copyFonts = () => {
  return src(fontsWatch)
    .pipe(dest(app + '/fonts/')
  );
}

// HTML Task
const htmlTask = () => {
  return src(htmlWatch)
    .pipe(dest(app)
  );
}

// Reload Task
function reload(done) {
  browserSync.reload();

	done();
}

// Server Task
const startServer = (done) => {
  browserSync.init({
    server: {
      baseDir: './app'
    }
  });

  done();
}

// Watch Task
const watchTask = (done) => {
  watch(styleWatch, cssTask);
  watch(jsWatch, jsTask);
  watch(imgWatch, series(cleanImages, imageTask, reload));
  watch(fontsWatch, series(cleanFonts, copyFonts, reload));
  watch(htmlWatch, series(htmlTask, reload));

  done();
}

// Exports
exports.default = series(
  clean,
  parallel(
    cssTask,
    jsTask,
    imageTask,
    copyFonts,
    htmlTask
  ),
  startServer,
  watchTask
);
exports.build = series(
  clean,
  parallel(
    cssTask,
    jsTask,
    imageTask,
    copyFonts,
    htmlTask
  )
);