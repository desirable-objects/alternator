var fs = require('fs'),
    fstream = require('fstream'),
    httpClient = require('request'),
    unzip = require('unzip'),
    mkdirp = require('mkdirp'),
    sf = require('sf'),
    config = require('config');

module.exports.upload = function(metadata, assets, callback) {

  var workDir = sf(config.workDir, metadata),
      currentDir = sf('{workDir}/{build}', {workDir: workDir, build: metadata.build}),
      previousDir = sf('{workDir}/{previous}', {workDir: workDir, previous: metadata.previous});

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
