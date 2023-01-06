const rootFolder = '/var/app/textile/public/upload/temp';
const tempLargeFolder = rootFolder + '/orig';
const fs = require('fs');
const path = require('path');
const sharp = require("sharp");
const async = require("async");

fs.readdir(tempLargeFolder, (err, files) => {

	files.forEach(file => {

		if (path.extname(file) == ".png") {

			async.parallel ([

				function (callback) {

		 			sharp(tempLargeFolder + '/' + file)
					  .resize(240, 240)
					  .max()
					  .toFile(rootFolder + '/thumb/' + file, function(err) {
					    // output.jpg is a 200 pixels wide and 200 pixels high image
					    // containing a scaled and cropped version of input.jpg
						if (err) {console.log(err); return (err);};
					   	callback(err, true);
					});

				},

				function (callback) {
					sharp(tempLargeFolder+ '/' + file, {'density':72})
						.resize(600, 400)
			  			.max()
					  	.toFile(rootFolder + '/large/' + file, function(err) {
					    // output.jpg is a 200 pixels wide and 200 pixels high image
					    // containing a scaled and cropped version of input.jpg
						if (err) {console.log(err); return (err);};
					   	callback(err, true);
			  		});
				}

			], function (err, results) {
				if (err) {console.log(err); return (err);};
				console.log(file + " is done.");
			});

		}

	});

});
