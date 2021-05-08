var gulp = require("gulp"),
  browserSync = require("browser-sync"),
  sass = require("gulp-sass"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  cssnano = require("gulp-cssnano"),
  rename = require("gulp-rename"),
  clean = require("gulp-clean"),
  prefix = require("gulp-autoprefixer"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  cache = require("gulp-cache"),
  htmlClean = require("gulp-htmlclean");

gulp.task("sass", function () {
  return gulp
    .src("sass/*.scss")
    .pipe(sass())
    .pipe(
      prefix(["last 15 versions", "> 1%", "ie 8", "ie 7"], { cascade: true })
    )
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
});

gulp.task("css-libs", function () {
  return gulp
    .src("css/libs.css")
    .pipe(cssnano())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("app/css"));
});

gulp.task("compile:css", gulp.series("sass", "css-libs"));

gulp.task("img", function () {
  return gulp
    .src("images/**/*")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()],
        })
      )
    )
    .pipe(gulp.dest("dist/images"));
});

gulp.task("clear", function () {
  return cache.clearAll();
});

gulp.task("clean", function () {
  return gulp.src("dist").pipe(clean());
});

gulp.task("build:css", function () {
  return gulp
    .src(["app/css/app.css", "app/css/libs.min.css"])
    .pipe(concat("app.min.css"))
    .pipe(cssnano())
    .pipe(gulp.dest("app/css"));
});

gulp.task("build:script", function () {
  return gulp
    .src("/js/**/*")
    .pipe(concat("script.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
});

gulp.task("build:html", function () {
  return (
    gulp
      .src("app/*.html")
      // .pipe(htmlClean())
      .pipe(gulp.dest("dist"))
  );
});

gulp.task(
  "build:all",
  gulp.parallel("img", "build:css", "build:script", "build:html")
);

gulp.task("build", gulp.series("clean", "build:all"));

gulp.task("serve", function () {
  browserSync({
    server: {
      baseDir: "./app",
    },
    notify: false,
  });

  gulp.watch("sass/*.scss", gulp.series("sass"));
  gulp.watch("app/*.html").on("change", browserSync.reload);
  gulp.watch("js/**/*.js").on("change", browserSync.reload);
});

gulp.task("default", gulp.series("compile:css", "serve"));
