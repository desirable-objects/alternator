var imageDiff = require('image-diff'),
    datauri = require('datauri'),
    config = require('config'),
    Path = require('path');

module.exports.comp = function(image, callback) {

    var currentDir = Path.join(__dirname, '..', config.screenshots, 'current');
    var previousDir = Path.join(__dirname, '..', config.screenshots, 'previous');

    console.log(currentDir, previousDir);

    var diff = {};
    var diffImage = '/tmp/'+image.path;

    imageDiff({
      actualImage: Path.join(currentDir, image.path),
      expectedImage: Path.join(previousDir, image.path),
      diffImage: diffImage
    }, function (err, imagesAreSame) {

      if (err) {
        return callback(err);
      }

      diff.name = image.name;
      diff.match = imagesAreSame;
      if (!imagesAreSame) {
        diff.difference = datauri(diffImage);
      }

      callback(null, diff);

    });
}
