var imageDiff = require('image-diff'),
    datauri = require('datauri'),
    config = require('config'),
    Path = require('path');

module.exports.compare = function(image, callback) {

    var currentDir = Path.join(__dirname, '..', config.screenshots, 'current');
    var previousDir = Path.join(__dirname, '..', config.screenshots, 'previous');

    console.log(currentDir, previousDir);

    var diff = {};
    var diffImage = '/tmp/'+image.path;

    var actualImage = Path.join(currentDir, image.path),
        expectedImage = Path.join(previousDir, image.path);

    imageDiff({
      actualImage: actualImage,
      expectedImage: expectedImage,
      diffImage: diffImage
    }, function (err, imagesAreSame) {

      if (err) {
        return callback(err);
      }

      diff.match = imagesAreSame;
      diff.name = image.name;

      if (!imagesAreSame) {
        diff.difference = datauri(diffImage);
      }

      callback(null, diff);

    });
}
