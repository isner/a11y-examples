
/**
 * Module dependencies.
 */

var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var Duo = require('duo');
var fs = require('fs-extra');
var path = require('path');

/**
 * Define constants.
 */

var EXAMPLES_DIR = 'examples';
var BUILD_DIR = 'dist';
var ENTRY_FILE = 'index.js';

/**
 * Delete the built directory.
 */

gulp.task('clean', function () {
	fs.removeSync(BUILD_DIR);
});

/**
 * Render jade templates as html
 * for each example.
 */

gulp.task('views', function () {
	gulp.src(path.join(EXAMPLES_DIR, '**/index.jade'))
		.pipe(jade())
		.pipe(gulp.dest(BUILD_DIR));
});

/**
 * Render stylus as css
 * for each example.
 */

gulp.task('styles', function () {
	gulp.src(path.join(EXAMPLES_DIR, '**/index.styl'))
		.pipe(stylus())
		.pipe(gulp.dest(BUILD_DIR));
});

/**
 * Use duo to traverse and build js modules
 * for each example.
 */

gulp.task('scripts', function () {
	fs.readdirSync(EXAMPLES_DIR).forEach(function (exampleDir) {
		var examplePath = path.join(__dirname, EXAMPLES_DIR, exampleDir);
		var entryPath = path.join(examplePath, ENTRY_FILE);

		fs.exists(entryPath, function (exists) {
			if (!exists) return;

			var entry = path.join(EXAMPLES_DIR, exampleDir, ENTRY_FILE);
			new Duo(__dirname).entry(entry)
			.copy(true)
			.run(function (err, data) {
				if (err) throw err;

				var target = path.join(BUILD_DIR, exampleDir, ENTRY_FILE);
				fs.writeFile(target, data, function (err) {
					if (err) throw err;
				});
			});
		});
	});
});

gulp.task('default', ['clean', 'views', 'styles', 'scripts']);

gulp.task('watch', function () {
  gulp.watch('examples/**/index.jade', ['views']);
  gulp.watch('examples/**/index.styl', ['styles']);
  gulp.watch('examples/**/*.{js,html}', ['scripts']);
});
