const
	$        = require('gulp-load-plugins')(),
	gulp     = require('gulp'),
	pngquant = require('imagemin-pngquant');


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.images.imagesSrcDir+'/**/*',{since: gulp.lastRun('copy:images')})

			.pipe($.newer(mainGulpConfig.images.imagesDistDir))
			.pipe($.imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: true }],
				use: [pngquant()]
			}))
			.pipe(gulp.dest(mainGulpConfig.images.imagesDistDir))
			.pipe($.debug({title:'images were copied into dist and minified'}));
	}
}