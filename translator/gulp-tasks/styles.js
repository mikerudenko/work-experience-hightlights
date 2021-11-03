const
	$              = require('gulp-load-plugins')(),
	gulp           = require('gulp'),
	plumberHandler = require('./plumber-handler'),
	isDevelopment  = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

/**
 * Styles function:
 * -with sourcemaps in development mode
 * -with inspector of errors plumber
 * -with autoprefixer
 */
module.exports = function(mainGulpConfig) {

	return function () {
		return gulp.src([mainGulpConfig.styles.stylesSrcDir +"/"+ mainGulpConfig.styles.mainSassFile])
			.pipe($.debug({title:'src'}))

			//cached styles - this is need!
			.pipe($.cached('styles'))

			//inspect on errors sass files
			.pipe($.plumber(plumberHandler))
			.pipe($.debug({title:'errors in sass file were inspected'}))

			//initialization of the sourcemaps
			.pipe($.if(isDevelopment,$.sourcemaps.init()))
			.pipe($.if(isDevelopment,$.debug({title:'initialization of sourcemaps'})))

			//compass task
			.pipe($.sass())
			.pipe($.debug({title:'sass task'}))

			//writing sourcemaps
			.pipe($.if(isDevelopment,$.sourcemaps.write()))
			.pipe($.if(isDevelopment,$.debug({title:'sourcemaps were written in styles'})))

			//autoprefixer to all files
			.pipe($.autoprefixer({
				browsers: ['last 2 versions', '> 1%'],
				cascade: false
			}))
			.pipe($.debug({title: 'css file was on autoprefixer process'}))

			//remember styles in cache
			.pipe($.remember('styles'))

			//minify all css files
			.pipe($.if(!isDevelopment,$.minifyCss()))
			.pipe($.if(!isDevelopment,$.debug({title:'css file was minified'})))

			.pipe(gulp.dest(mainGulpConfig.styles.stylesDistDir));
	}
}