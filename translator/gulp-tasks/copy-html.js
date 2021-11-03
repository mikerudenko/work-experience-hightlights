const
	$             = require('gulp-load-plugins')(),
	gulp          = require('gulp'),
	pngquant      = require('imagemin-pngquant'),
	minifyHtml    = require('gulp-minify-html'),
	isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';


module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src(mainGulpConfig.srcDir+'/**/*.html',{since: gulp.lastRun('copy:html')})
			//newer for optimization
			.pipe($.newer(mainGulpConfig.distDir))

			.pipe($.debug({title:'src'}))

			.pipe($.if(!isDevelopment,minifyHtml({ empty: true })))
			.pipe($.if(!isDevelopment,$.debug({title:'html files were copied into dist and minified'})))
			.pipe($.if(isDevelopment,$.debug({title:'html files were copied into dist'})))
			.pipe(gulp.dest(mainGulpConfig.distDir));
	}
};