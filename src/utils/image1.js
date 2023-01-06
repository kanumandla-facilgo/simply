var sharp = require("sharp");
sharp('public/upload/myimage.png')
  .resize(240, 240)
  .background({r:0,g:0,b:0,alpha:0})
  .embed()
  .toFormat(sharp.format.webp)
  .toFile('public/upload/output00.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/myimage.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/output01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/qx3j8xjTVDg92g0l.png')
  .resize(240, 240)
  .toFile('public/upload/output1.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/qx3j8xjTVDg92g0l.png')
  .resize(240, 240)
  .background({r:0,g:0,b:0,alpha:0})
  .embed()
  .toFormat(sharp.format.webp)
  .toFile('public/upload/output2.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/yI4hNoUPi4YYOp37.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/output3.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/yI4hNoUPi4YYOp37.png')
  .resize(240, 240)
  .toFile('public/upload/output11.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/yI4hNoUPi4YYOp37.png')
  .resize(240, 240)
  .background({r:0,g:0,b:0,alpha:0})
  .embed()
  .toFormat(sharp.format.webp)
  .toFile('public/upload/output22.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/qx3j8xjTVDg92g0l.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/output33.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });
