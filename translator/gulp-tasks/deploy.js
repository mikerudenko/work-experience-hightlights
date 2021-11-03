const
	$    = require('gulp-load-plugins')(),
	gulp = require('gulp');


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.distDir+'/**/*')
			.pipe($.sftp(mainGulpConfig.sftpConfig))
			.pipe($.debug({title: 'project was deployed on server'}))
	}
}