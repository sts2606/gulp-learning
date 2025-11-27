import { src, dest, task, watch, series, parallel } from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import postcss from 'gulp-postcss';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';
import imageminPngquant from 'imagemin-pngquant';

const sass = gulpSass(dartSass);
const browser = browserSync.create();

const PATH = {
  dist: './dist',
  html: './src/*.html',
  scssFiles: './src/scss/*.scss',
  cssDir: './dist/css',
  jsFiles: './src/**/*.js',
  jsDistDir: './dist/js',
  imgFiles: './src/images/*',
  imgDistDir: './dist/images',
};

function html() {
  return src(PATH.html).pipe(dest(PATH.dist)).pipe(browser.stream());
}

function scss() {
  return src(PATH.scssFiles, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS())
    .pipe(dest(PATH.cssDir, { sourcemaps: '.' }))
    .pipe(browser.stream());
}

function js() {
  return src(PATH.jsFiles, { sourcemaps: true })
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest(PATH.jsDistDir, { sourcemaps: '.' }))
    .pipe(browser.stream());
}

export function images() {
  return src(PATH.imgFiles, { encoding: false })
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [imageminPngquant()],
      })
    )
    .pipe(dest(PATH.imgDistDir));
}

function serve() {
  browser.init({
    server: {
      baseDir: './dist',
    },
    port: 3000,
    notify: false,
    open: true,
  });

  watch(PATH.html, html);
  watch(PATH.scssFiles, scss);
  watch(PATH.imgFiles, images);
  watch(PATH.jsFiles, js);
}

const build = series(parallel(html, scss, js, images));

const dev = series(build, serve);

task('build', build);
task('watch', dev);
