const
	$    = require('gulp-load-plugins')(),
	path = require('path');


/*****************************************PLumber errorHandler*************************************/
	//the title and icon that will be used for the Gulp notifications
	let notifyInfo = {
		title: 'Gulp',
		icon: path.join(__dirname, 'gulp.png')
	};

	//error notification settings for plumber
	let plumberErrorHandler = { errorHandler: $.notify.onError({
			title: notifyInfo.title,
			icon: notifyInfo.icon,
			sound: 'Bottle',
			message: "Error: <%= error.message %>"
		})
	};

module.exports = plumberErrorHandler;