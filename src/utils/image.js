var sharp = require("sharp");

sharp('public/upload/myimage.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/output01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/main1.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/main01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/blue1.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/blue01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/purple1.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/purple01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/orange1.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/orange01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

sharp('public/upload/green1.png')
  .resize(240, 240)
  .max()
  .toFile('public/upload/green01.png', function(err) {
    // output.jpg is a 200 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
  });

