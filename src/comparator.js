var imageDiff = require('image-diff'),
    datauri = require('datauri'),
    config = require('config'),
    Path = require('path'),
    sf = require('sf');

module.exports.compare = function(metadata, image, callback) {

    var diff = {};
    var workDir = sf(config.workDir, metadata);
    var diffImage = sf('{workDir}/temp/{filename}', {
      workDir: workDir,
      filename: image
    });

    var actualImage = Path.join(metadata.currentDir, image),
        expectedImage = Path.join(metadata.previousDir, image);

    imageDiff({
      actualImage: actualImage,
      expectedImage: expectedImage,
      diffImage: diffImage
    }, function (err, imagesAreSame) {

      if (err) {
        return callback(err);
      }

      diff.match = imagesAreSame;
      diff.name = image;

      if (!imagesAreSame) {
        diff.difference = datauri(diffImage);
      }

      callback(null, diff);

    });
}
