"use strict";

var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var htmlMin = require("gulp-htmlmin");
var sass = require("gulp-sass")(require("sass"));
var cleanCss = require("gulp-clean-css");
var panini = require("panini");
var rename = require("gulp-rename");
var rimraf = require("rimraf");
var replace = require("gulp-replace");

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf("dist", done);
}

// Copy files out of the assets folder images
function images() {
  return gulp
    .src("src/assets/images/**/*")
    .pipe(gulp.dest("dist/assets/images"));
}

// Copy files out of the assets folder fonts
function fonts() {
  return gulp.src("src/assets/fonts/**/*").pipe(gulp.dest("dist/assets/fonts"));
}

gulp.task("icons", function () {
  return gulp
    .src("node_modules/@fortawesome/fontawesome-free/webfonts/*")
    .pipe(gulp.dest("dist/webfonts/"));
});

/* Compile SASS into Minify CSS */
gulp.task("sass", function () {
  return gulp
    .src([
      "node_modules/bootstrap/scss/bootstrap.scss",
      "node_modules/slick-carousel/slick/slick.scss",
      "node_modules/slick-carousel/slick/slick-theme.scss",
      "src/scss/*.scss",
    ])
    .pipe(sass())
    .pipe(cleanCss())
    .pipe(replace("src/scss", ""))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("dist/css"));
});

// Move the js files into our /dist/js folder
gulp.task("js", function () {
  return gulp
    .src([
      "node_modules/bootstrap/dist/js/bootstrap.min.js",
      "node_modules/jquery/dist/jquery.min.js",
      "node_modules/popper.js/dist/umd/popper.min.js",
      "node_modules/slick-carousel/slick/slick.min.js",
      "src/js/main.js",
    ])
    .pipe(gulp.dest("dist/js"))
    .pipe(browserSync.stream());
});

// Move the css files into our /dist/css folder
gulp.task("css", function () {
  return gulp
    .src("node_modules/@fortawesome/fontawesome-free/css/all.min.css")
    .pipe(gulp.dest("dist/css/"));
});

/* Integrate All Layout from Panini */
gulp.task("panini", function () {
  return gulp
    .src("src/pages/**/*.html")
    .pipe(
      panini({
        root: "src/pages/",
        layouts: "src/layouts/",
        partials: "src/partials/",
        data: "src/data/",
      })
    )
    .pipe(gulp.dest("dist/"));
});

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

/* Make HTML Clean and Minify, also Make CSS Inline on Tag */
gulp.task("htmlMin", function () {
  return gulp
    .src("dist/**/*.html")
    .pipe(
      htmlMin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest("dist/"));
});

/* Static Server */
gulp.task("browserSync", function () {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
  });
});

/* Watch all Changes */
gulp.task("watch", function () {
  gulp.watch("src/scss/*.scss", gulp.parallel("sass"));
  gulp.watch("src/pages/**/*.html", gulp.parallel("panini"));
  gulp.watch(
    "src/{layouts,partials}/**/*.html",
    gulp.series(resetPages, "panini")
  );
  gulp.watch("src/assets/images/**/*", gulp.series(images));
  gulp.watch("src/js/**/*", gulp.parallel("js"));
  gulp.watch("src/js/**/*").on("change", browserSync.reload);
  gulp.watch("src/assets/images/**/*").on("change", images, browserSync.reload);
  gulp
    .watch("src/{layouts,partials,data}/**/*")
    .on("change", browserSync.reload);
  gulp.watch("src/pages/**/*.html").on("change", browserSync.reload);
  gulp.watch("src/scss/*.scss").on("change", browserSync.reload);
});

/* Build app, run the server, and watch for file changes */
gulp.task(
  "default",
  gulp.parallel(
    "sass",
    "js",
    "watch",
    "panini",
    images,
    fonts,
    "css",
    "icons",
    "browserSync"
  )
);

/* Build the "dist" folder by running all of the below tasks */
gulp.task(
  "build",
  gulp.series(
    clean,
    gulp.parallel(
      "sass",
      "js",
      "panini",
      images,
      fonts,
      "icons",
      "css",
      "htmlMin"
    )
  )
);
