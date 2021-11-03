const
	$    = require('gulp-load-plugins')(),
	gulp = require('gulp');


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.wiredepIndexFile)
			.pipe($.wiredep({
				directory: mainGulpConfig.bower.bowerSrcDir
			}))
			.pipe($.debug({title:'all bower dependencies were added in '+ mainGulpConfig.wiredepIndexFile}))
			.pipe(gulp.dest(mainGulpConfig.srcDir));
	}
}