import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import sourcemap from 'gulp-sourcemaps';
import del from 'del';
import htmlmin from 'gulp-htmlmin';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(browser.stream());
}

// Html

export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
}

// Images

export const copyImages = () => {
  return gulp.src("source/img/**/*.jpg")
    .pipe(gulp.dest("build/img"))
}

export const optimizationImages = () => {
  return gulp.src("build/img/**/*.jpg")
    .pipe(squoosh())
    .pipe(gulp.dest("build/img"))
}

export const webp = () => {
  return gulp.src("build/img/**/*.jpg")
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest("build/img"))
}

// Svg

export const svg = () => {
  return gulp.src("source/img/*.svg")
    .pipe(svgo())
    .pipe(gulp.dest("build/img"))
}

export const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

// Copy

export const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

// Clean

export const clean = () => {
  return del("build");
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}


export const build = gulp.series(
  clean,
  copyImages,
  gulp.parallel(
    html,
    copy,
    svg,
    sprite,
    optimizationImages,
    webp,
    styles
  )
);


export default gulp.series(
  clean,
  copyImages,
  gulp.parallel(
    html,
    copy,
    svg,
    sprite,
    webp,
    styles,
  ),
  gulp.series(
    server,
    watcher
  )
);
