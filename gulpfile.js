
var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var Duo = require('duo');
var fs = require('fs-extra');
var path = require('path');

var examplesDir = 'examples';
var buildDir = 'dist';
var entryFile = 'index.js';

var duo = new Duo(__dirname);

gulp.task('views', function () {
	gulp.src(path.join(examplesDir, '**/index.jade'))
		.pipe(jade())
		.pipe(gulp.dest(buildDir));
});

gulp.task('styles', function () {
	gulp.src(path.join(examplesDir, '**/index.styl'))
		.pipe(stylus())
		.pipe(gulp.dest(buildDir));
});

gulp.task('scripts', function () {
	fs.readdirSync(examplesDir).forEach(function (exampleDir) {
		var examplePath = path.join(__dirname, examplesDir, exampleDir);
		var entryPath = path.join(examplePath, entryFile);
		fs.exists(entryPath, function (exists) {
			if (!exists) return;
			var entry = path.join(examplesDir, exampleDir, entryFile);
			duo.entry(entry)
			.run(function (err, data) {
				if (err) throw err;

				var target = path.join(buildDir, exampleDir, entryFile);
				fs.writeFile(target, data, function (err) {
					if (err) throw err;
				});
			});
		});
	});
});

gulp.task('default', ['views', 'styles', 'scripts']);

gulp.task('watch', function () {
  gulp.watch('examples/**/index.jade', ['views']);
  gulp.watch('examples/**/index.styl', ['styles']);
  gulp.watch('examples/**/*.js', ['scripts']);
});
