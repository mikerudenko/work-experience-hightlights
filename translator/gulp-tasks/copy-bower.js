const
	$    = require('gulp-load-plugins')(),
	gulp = require('gulp');


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.bower.bowerSrcDir+'/**/*',{since: gulp.lastRun('copy:bower')})

			.pipe($.newer(mainGulpConfig.bower.bowerDistDir))

			.pipe(gulp.dest(mainGulpConfig.bower.bowerDistDir))
			.pipe($.debug({title:'bower components were copied into dist'}));
	}
}