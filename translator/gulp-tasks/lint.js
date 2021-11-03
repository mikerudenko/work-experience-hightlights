const
	$              = require('gulp-load-plugins')(),
	gulp           = require('gulp'),
	plumberHandler = require('./plumber-handler'),
	through2       = require('through2').obj,
	conbine        = require('stream-combiner2').obj,
	fs             = require('fs'),
	isDevelopment  = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

module.exports = function(mainGulpConfig) {
	return function () {
		let eslintResults = {},
			cacheFilePath = process.cwd() + '/tmp/lintCache.json';

		try {
			eslintResults = JSON.parse(fs.readFileSync(cacheFilePath));
		} catch (e) {

		}

		return gulp.src([mainGulpConfig.srcDir+'/**/*.js', '!app/bower_components/**'], {read:false})
			.pipe($.debug({title:'start inspect js file by Eslint'}))
			.pipe($.if(
				function(file) {
					return eslintResults[file.path] && eslintResults[file.path].mtime == file.stat.mtime.toJSON();
				},
				//if true 
				through2(function(file,enc, callback) {
					file.eslint = eslintResults[file.path].eslint;
					callback(null, file);
				}),
				//if false
				conbine(
					through2(function(file, enc, callback) {
						file.contents = fs.readFileSync(file.path);
						callback(null, file);
					}),
					$.eslint(),
					$.debug({title:'add new reports of your code in /tmp/lintCache.json'}),
					through2(function(file, enc, callback) {
						eslintResults[file.path] = {
							eslint: file.eslint,
							mtime: file.stat.mtime
						};
						callback(null, file);
					})
				)
			))
			.pipe($.eslint.format())
			.on('end', function() {
				fs.writeFileSync(cacheFilePath, JSON.stringify((eslintResults)));
			});
	}
}