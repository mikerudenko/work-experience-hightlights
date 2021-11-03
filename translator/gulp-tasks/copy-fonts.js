const
	$    = require('gulp-load-plugins')(),
	gulp = require('gulp');


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.fonts.fontsSrcDir+'/**/*',{since: gulp.lastRun('copy:fonts')})

			.pipe($.newer(mainGulpConfig.fonts.fontsDistDir))

			.pipe(gulp.dest(mainGulpConfig.fonts.fontsDistDir))
			.pipe($.debug({title:'fonts were copied into dist'}));
	}
}