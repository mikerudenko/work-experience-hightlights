const
	$    = require('gulp-load-plugins')(),
	gulp = require('gulp');


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.distDir, {read: false})
			.pipe($.clean())
			.pipe($.debug({title:'dist folder was deleted'}));
	}
}