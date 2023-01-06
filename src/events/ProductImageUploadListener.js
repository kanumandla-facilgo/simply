const Util  = require("../utils");
const Config = require("../config/config");
const fs = require("fs");
const Promise = require('bluebird');
const async = require("async");
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpeg = require('imagemin-mozjpeg');

class ProductImageUploadListener {
    
    constructor (eventManager) {
        eventManager.on(Util.LocalEventTypeEnum.ProductImageUpload, function(event) {
            event.type_id = Util.LocalEventTypeEnum.ProductImageUpload;              
            
            var fileref = event.document_id;
            var filename = fileref + ".jpg";
			var pngFilename = fileref + ".png";

	        var rootpath = process.cwd() + Config.local.image_server_root; //till /upload
	        var filenameWithPath =  rootpath + Config.local.image_server_folder_small + filename;
			var filenameWithPathOrig =  rootpath + Config.local.image_server_folder_orig + filename;
			var filenameWithPathOriginal =  rootpath + Config.local.image_server_folder_original + pngFilename;
			var filenameWithPathLarge =  rootpath + Config.local.image_server_folder_large + filename;
		 
			var jimp = require("jimp");

			jimp.read(filenameWithPathOriginal, function(error, img){
				if (error) {
					console.error(error);
					return (error);
				}
				img.quality(70)
					.write(filenameWithPathOrig, () => {

						Promise.promisify(fs.readFile)(filenameWithPathOrig)
						  .then(buffer => {
						    return imagemin.buffer(buffer, {
						      plugins: [
						          imageminJpegtran({progressive: true}),
						          imageminMozjpeg({quality: 50})
						      ]
						    })
						  })
						  .then(outBuffer => {
						  	fs.writeFile(filenameWithPathOrig, outBuffer, function (err) {			
							});
						  }).catch(err => {
						    console.error(err)
						  })

						async.parallel ([
							function (callback) {

								jimp.read(filenameWithPathOriginal, function (err, image) {

				  					if (err) return next(err);

				  					image.resize(360, jimp.AUTO)
				  						.quality(100)
				  						.write(filenameWithPath, () => {										

											Promise.promisify(fs.readFile)(filenameWithPath)
											  .then(buffer => {
											    return imagemin.buffer(buffer, {
											      plugins: [
											          imageminJpegtran({progressive: true}),
											          imageminMozjpeg({quality: 70})
											      ]
											    })
											  })
											  .then(outBuffer => {
											  	fs.writeFile(filenameWithPath, outBuffer, function (err) {			
												});
											  }).catch(err => {
											    console.error(err)
											  })
										});

				  					return callback(err, null);
								});

							},

							function (callback) {

								jimp.read(filenameWithPathOriginal, function (err, image) {

				  					if (err) return next(err);

				  					image.resize(600, jimp.AUTO)
				  						.quality(100)
				  						.write(filenameWithPathLarge, () => {										

											Promise.promisify(fs.readFile)(filenameWithPathLarge)
											  .then(buffer => {
											    return imagemin.buffer(buffer, {
											      plugins: [
											          imageminJpegtran({progressive: true}),
											          imageminMozjpeg({quality: 70})
											      ]
											    })
											  })
											  .then(outBuffer => {
											  	fs.writeFile(filenameWithPathLarge, outBuffer, function (err) {			
												});
											  }).catch(err => {
											    console.error(err)
											  })
										});


				  					return callback(err, null);
								});

							}

						], function (err, results) {
							console.error(err);
						});
					})
			});	

		});
    }
}

module.exports = ProductImageUploadListener;
