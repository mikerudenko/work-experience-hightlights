'use strict';

const
	gulp = require('gulp');

let mainGulpConfig = {
	distDir: 'dist',
	srcDir: 'app',
	wiredepIndexFile: 'app/index.html',
	styles: {
		mainSassFile : 'index.sass',
		stylesSrcDir : 'app/styles',
		stylesDistDir: 'dist'
	},
	images: {
		imagesSrcDir : 'app/assets/',
		imagesDistDir: 'dist/assets/'
	},
	fonts: {
		fontsSrcDir : 'app/assets/fonts',
		fontsDistDir: 'dist/assets/fonts'
	},
	bower: {
		bowerSrcDir : 'app/bower_components',
		bowerDistDir: 'dist/bower_components'
	},
	browserSync: {
		server: 'dist'
	},
	sftpConfig: {
		host: 'SomeHost',
		user: 'SomeUser',
		pass: 'SomePassword',
		remotePath: 'RemotePasswordOnServer'
	}
};

function lazyRequireTask(taskName, path, options) {
	options = options || {};
	options.taskName = taskName;

	//create a new task
	gulp.task(taskName, function(callback) {
		let task = require(path).call(this, options);

		return task(callback);
	});
}

//Write bower dependencies in bowerINdexFile
	lazyRequireTask('wiredep','./gulp-tasks/wiredep',mainGulpConfig);

//Styles function
	lazyRequireTask('styles','./gulp-tasks/styles',mainGulpConfig);

//Deploy function
	lazyRequireTask('deploy','./gulp-tasks/deploy',mainGulpConfig);

//Lint function
	lazyRequireTask('lint','./gulp-tasks/lint',mainGulpConfig);

//Watch function
	lazyRequireTask('watch','./gulp-tasks/watch',mainGulpConfig);

//Serve function
	lazyRequireTask('serve','./gulp-tasks/serve',mainGulpConfig);

//Scripts function
	lazyRequireTask('scripts','./gulp-tasks/scripts',mainGulpConfig);

//Copy functions
	lazyRequireTask('copy:bower','./gulp-tasks/copy-bower',mainGulpConfig);
	lazyRequireTask('copy:fonts','./gulp-tasks/copy-fonts',mainGulpConfig);
	lazyRequireTask('copy:images','./gulp-tasks/copy-images',mainGulpConfig);
	lazyRequireTask('copy:html','./gulp-tasks/copy-html',mainGulpConfig);
	gulp.task('copy:assets',gulp.parallel('copy:images','copy:fonts','copy:bower','copy:html'));

//Clean task
	lazyRequireTask('clean','./gulp-tasks/clean',mainGulpConfig);

//Build task
	gulp.task('build', gulp.series(gulp.parallel('copy:assets','styles','scripts'),'wiredep'));

//Default task
	gulp.task('default', gulp.series('build',gulp.parallel('watch','serve')));