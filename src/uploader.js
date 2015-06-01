var fs = require('fs'),
    fstream = require('fstream'),
    httpClient = require('request'),
    unzip = require('unzip'),
    mkdirp = require('mkdirp'),
    sf = require('sf'),
    config = require('config'),
    _ = require('lodash-node');

module.exports.upload = function(metadata, assets, callback) {

  var workDir = sf(config.workDir, metadata);
  var directoryConfig = _.defaults({workDir: workDir}, metadata);

  console.log(workDir, directoryConfig)

  var currentDir = sf('{workDir}/{build}/{platform}/{browser}/{version}', directoryConfig),
      previousDir = sf('{workDir}/{previous}/{platform}/{browser}/{version}', directoryConfig);

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
