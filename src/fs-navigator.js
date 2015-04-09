var comparator = require('./comparator.js'),
    _ = require('lodash-node'),
    walk = require('walkdir'),
    Path = require('path'),
    async = require('async');

module.exports.traverse = function(tree, callback) {

  var analysis = [];
  var files = [];
  var versions = {};

  walk.sync(tree, function(path, stat) {

    if (stat.isFile()) {
      files.push(Path.relative(tree, path));
    };

  });

  async.each(files, function(file, callback) {

    var parts = path.split('/');
    var platform = parts[0],
        browser = parts[1],
        version = parts[2];

    comparator.comp(image, function(err, diff) {

      if (err) {
        console.error(err);
      }


    });

  }, function(err) {
    callback(err, analysis);
  });

}
