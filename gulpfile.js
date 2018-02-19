gulp = require("gulp");
plumber = require("gulp-plumber");
notify = require("gulp-notify");
watchify = require("gulp-watchify");
rename = require("gulp-rename");
buffer = require("vinyl-buffer");
sourcemaps = require("gulp-sourcemaps");
exec = require("child_process").exec;

gulp.task("release", ["build:ddf", "browserify"]);

gulp.task("default", ["browserify"]);

watching = false;
gulp.task("enable-watch-mode", function() {
  watching = true;
});

debugging = false;
gulp.task("enable-debug-mode", function() {
  debugging = true;
});
gulp.task(
  "browserify",
  watchify(function(watchify) {
    gulp
      .src("src/js/index.js")
      .pipe(sourcemaps.init())
      .pipe(plumber({ errorHandler: notify.onError("<%= error.message %>") }))
      .pipe(
        watchify(
          debugging
            ? {
                watch: watching
              }
            : {
                watch: watching,
                transform: ["uglifyify"]
              }
        )
      )
      .pipe(buffer())
      .pipe(sourcemaps.write(".maps"))
      .pipe(gulp.dest("build/js/"));
  })
);

gulp.task("build:ddf", ["doc:ddf"], function() {
  exec("browserify -r ddf -g uglifyify --outfile build/js/lib/ddf.js", function(
    a,
    b,
    c
  ) {
    exec('echo var ddf = require("ddf");>> build/js/lib/ddf.js');
  });
});

gulp.task("watchify", ["enable-watch-mode", "enable-debug-mode", "browserify"]);
gulp.task("watch", ["build:ddf", "watchify"], function() {
  gulp.watch("src/module/*.js", ["build:ddf"]);
  gulp.watch(["local/**", "src/vender/**"], ["build:asset:local"]);
});
