const
	$              = require('gulp-load-plugins')(),
	gulp           = require('gulp'),
	plumberHandler = require('./plumber-handler'),
	isDevelopment  = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

/**
* Scripts function:
* -with sourcemaps
* -with inspector of errors plumber
* -with minification
* -with concatenation
*/
module.exports = function(mainGulpConfig) {
	return function () {
		return gulp.src([mainGulpConfig.srcDir+'/**/*.js', '!app/bower_components/**'])
			.pipe($.debug({title:'src'}))

			//cached styles - this is need!
			.pipe($.cached('scripts'))

			//inspect on errors sass files
			.pipe($.plumber(plumberHandler))
			.pipe($.debug({title:'errors in sass file were inspected'}))

			//initialization of the sourcemaps
			.pipe($.if(isDevelopment,$.sourcemaps.init()))
			.pipe($.if(isDevelopment,$.debug({title:'initialization of sourcemaps'})))

			//compiled from es-2015
			.pipe($.babel({
				presets: ['es2015']
			}))
			.pipe($.debug({title:'compiled from Ecmascript-2015'}))

			
			//remember scripts in cache
			.pipe($.remember('scripts'))

			//concat all js files to one
			.pipe($.concat('all.js'))
			.pipe($.debug({title:'all files are concatted'}))

			//writing sourcemaps
			.pipe($.if(isDevelopment,$.sourcemaps.write()))
			.pipe($.if(isDevelopment,$.debug({title:'sourcemaps were written in styles'})))

			//minify all js files
			.pipe($.if(!isDevelopment,$.uglify()))
			.pipe($.if(!isDevelopment,$.debug({title:'all.js file was minified'})))

			.pipe(gulp.dest(mainGulpConfig.distDir));
	}
}