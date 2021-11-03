const
	$    = require('gulp-load-plugins')(),
	path = require('path'),
	gulp = require('gulp');

module.exports = function(mainGulpConfig) {
		return function () {
			gulp.watch(mainGulpConfig.srcDir+'/**/*.html', gulp.series('copy:html'));
			gulp.watch(mainGulpConfig.srcDir+'/**/*.js', gulp.series('scripts'))
				.on('unlink', function(filepath) {
					//console.log(filepath);
					$.remember.forget('scripts', path.resolve(filepath));
					delete $.cached.caches.scripts[path.resolve(filepath)];
				});
			gulp.watch(mainGulpConfig.styles.stylesSrcDir+'/**/*.sass', gulp.series('styles'))
				.on('unlink', function(filepath) {
					//console.log(filepath);
					$.remember.forget('styles', path.resolve(filepath));
					delete $.cached.caches.styles[path.resolve(filepath)];
				});
	}
}