var fs = require('fs'),
    fstream = require('fstream'),
    httpClient = require('request'),
    unzip = require('unzip'),
    mkdirp = require('mkdirp'),
    sf = require('sf');

module.exports.upload = function(metadata, assets, callback) {

  var currentDir = sf('/tmp/{owner}/{build}', metadata),
      previousDir = sf('/tmp/{owner}/{previous}', metadata);

      metadata.currentDir = currentDir;
      metadata.previousDir = previousDir;

  mkdirp(currentDir, function() {

    var writeStream = fstream.Writer(metadata.currentDir);
    writeStream.on('close', function() {

      if (metadata.previous === 'initial') {
        fs.symlink(metadata.currentDir, metadata.previousDir, function() {
          return callback(null, metadata);
        });
      } else {
        callback(null, metadata);
      }
    });

    httpClient(assets).pipe(unzip.Parse()).pipe(writeStream);
  });

}
