const fs = require("fs");
const mysql = require("./mysql");
const jimp = require('jimp')
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpeg = require('imagemin-mozjpeg');
const Promise = require('bluebird');
const async = require("async");

function run(callback) {

    const cmd = "select id, url, url_large from images where url like '%simplytextile.com%' order by id";

    mysql.openConnection (function (err, connection) {
    
        if (err) console.log(err);
    
        connection.query(cmd, [], function (err, rows) {
    
            if (err) console.log(err);
    
            if (rows && rows.length > 0)
            {
                let i = 0;
                async.eachSeries (rows, function iterator(imageData, incb) {
    
                    if(imageData.url != '' && imageData.url != null)
                    {
                        console.log(`${++i} Processing ${imageData.url} ...`);
    
                        var filenameWithPathOrig = imageData.url;
                        var URL1 = require('url').parse(filenameWithPathOrig);
                        filenameWithPathOrig = filenameWithPathOrig.replace("upload", "upload/original");
    
                        var filenameWithPath_orig = '/tmp/orig' + URL1.pathname.replace(/(^\/|\/$)/g,'')
                        var filenameWithPath = '/tmp/' + URL1.pathname.replace(/(^\/|\/$)/g,'')
                        var filenameWithPath_large = '/tmp/large' + URL1.pathname.replace(/(^\/|\/$)/g,'')
    
                        filenameWithPath = filenameWithPath.replace(".png", ".jpg");
                        filenameWithPath_large = filenameWithPath_large.replace(".png", ".jpg");
                        filenameWithPath_orig = filenameWithPath_orig.replace(".png", ".jpg");
    
                        filenameWithPathOrig = filenameWithPathOrig.replace("https://www.simplytextile.com", "/var/app/textile/public")
                        if (fs.existsSync(filenameWithPathOrig)) {
    
                            jimp.read(filenameWithPathOrig, function (err, image) {
                                if (err) console.log(err);
                                if(image != undefined)
                                {
                                    image.quality(70)
                                    .write(filenameWithPath_orig, () => {
                                        Promise.promisify(fs.readFile)(filenameWithPath_orig)
                                        .then(buffer => {
                                            return imagemin.buffer(buffer, {
                                            plugins: [
                                                imageminJpegtran({progressive: true}),
                                                imageminMozjpeg({quality: 50})
                                            ]
                                            })
                                        })
                                        .then(outBuffer => {
                                            fs.writeFile(filenameWithPath_orig, outBuffer, function (err) {
                                                image.resize(360, jimp.AUTO)
                                                .quality(100)
                                                .write(filenameWithPath, () => {
        
                                                        Promise.promisify(fs.readFile)(filenameWithPath)
                                                        .then(buffer => {
                                                            return imagemin.buffer(buffer, {
                                                            plugins: [
                                                                imageminJpegtran({progressive: true}),
                                                                imageminMozjpeg({quality: 50})
                                                            ]
                                                            })
                                                        })
                                                        .then(outBuffer => {
                                                            fs.writeFile(filenameWithPath, outBuffer, function (err) {
                                                                jimp.read(filenameWithPathOrig, function (err, image) {
                                                                    if (err) console.log(err);
                                                                    image.resize(600, jimp.AUTO)
                                                                        .quality(100)
                                                                        .write(filenameWithPath_large, () => {
                                                                            Promise.promisify(fs.readFile)(filenameWithPath_large)
                                                                            .then(buffer => {
                                                                                return imagemin.buffer(buffer, {
                                                                                plugins: [
                                                                                    imageminJpegtran({progressive: true}),
                                                                                    imageminMozjpeg({quality: 70})
                                                                                ]
                                                                                })
                                                                            })
                                                                            .then(outBuffer => {
                                                                                    fs.writeFile(filenameWithPath_large, outBuffer, function (err) {
                                                                                        incb();
                                                                                    });
                                                                            }).catch(err => {
                                                                                console.log(err);
                                                                                incb();
                                                                            })
                                                                        });
                                                                });

                                                            });
                                                        }).catch(err => {
                                                            console.log(err)
                                                            incb();
                                                        })
                                                });
                                            });
                                        }).catch(err => {
                                            console.log(err)
                                            incb();
                                        })
                                    });
                                }
                            });
    
                        } else {
                            console.log(`File ${filenameWithPathOrig} not found.`);
                            incb();
                        } //if file exists
                    } else {
                        incb();
                    }// if imgData
                }, function(err) {
                    mysql.closeConnection(connection);
                    console.log("Done");
                    return callback();     
                });
    
            }
        });
    
    });

}

run( () => {
    console.log("Completed.");
});