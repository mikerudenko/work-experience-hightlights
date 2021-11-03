const
	browserSync = require('browser-sync').create();

module.exports = function(mainGulpConfig) {
	return function () {
		browserSync.init({
			server: mainGulpConfig.browserSync.server
		});

		browserSync.watch(mainGulpConfig.browserSync.server+"/**/*.*")
			.on("change", browserSync.reload)
	}
}