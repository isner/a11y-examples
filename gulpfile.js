
/**
 * Module dependencies.
 */

var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var fs = require('fs-extra');
var gulp = require('gulp');
var path = require('path');
var Duo = require('duo');

/**
 * Define constants.
 */

var BOWER = 'bower_components';
var EXAMPLES = 'examples';
var INDEX = 'index.js';
var DIST = 'dist';

/**
 * `default` task.
 */

gulp.task('default', [
  'clean',
  'bower',
  'views',
  'styles',
  'scripts'
]);

/**
 * Delete the built directory.
 */

gulp.task('clean', function () {
  fs.removeSync(DIST);
});

/**
 * Copy bower components to distribution directory.
 */

gulp.task('bower', function () {
  fs.copySync(path.join(BOWER, 'jquery/dist/jquery.min.js'),
    path.join(DIST, 'jquery.min.js'));
  fs.copySync(path.join(BOWER, 'jquery-ui/jquery-ui.min.js'),
    path.join(DIST, 'jquery-ui.min.js'));
});

/**
 * Render jade templates as html
 * for each example.
 */

gulp.task('views', function () {
  gulp.src(path.join(EXAMPLES, '**/index.jade'))
    .pipe(jade())
    .pipe(gulp.dest(DIST));
});

/**
 * Render stylus as css
 * for each example.
 */

gulp.task('styles', function () {
  gulp.src(path.join(EXAMPLES, '**/*.styl'))
    .pipe(stylus())
    .pipe(gulp.dest(DIST));
});

/**
 * Use duo to traverse and build js modules
 * for each example.
 */

gulp.task('scripts', function () {
  var exampleDirs = fs.readdirSync(EXAMPLES);

  exampleDirs.forEach(function (exampleDir) {

    var entryPath =
      path.join(__dirname, EXAMPLES, exampleDir, INDEX);

    if (fs.existsSync(entryPath)) {

      new Duo(__dirname)
      .entry(path.join(EXAMPLES, exampleDir, INDEX))
      .copy(true)
      .run(function (err, data) {
        if (err) throw err;

        var target = path.join(DIST, exampleDir, INDEX);

        fs.ensureFile(target, function (err) {
          if (err) throw err;

          fs.writeFile(target, data, function (err) {
            if (err) throw err;
          });
        });
      });
    }
  });
});

/**
 * `watch` task.
 */

gulp.task('watch', function () {
  gulp.watch('examples/**/index.jade', ['views']);
  gulp.watch('examples/**/index.styl', ['styles']);
  gulp.watch('examples/**/*.{js,html}', ['scripts']);
  gulp.watch('lib/*', ['scripts']);
});
