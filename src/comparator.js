var imageDiff = require('image-diff'),
    datauri = require('datauri'),
    config = require('config'),
    Path = require('path'),
    sf = require('sf');

module.exports.compare = function(metadata, image, callback) {

    var currentDir = metadata.currentDir;
    var previousDir = metadata.previousDir;

    console.log('comping', currentDir, previousDir);

    var diff = {};
    var diffImage = sf('/tmp/{owner}/temp/{filename}', {
      owner: metadata.owner,
      filename: image.path
    });

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
