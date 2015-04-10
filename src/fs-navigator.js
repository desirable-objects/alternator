var comparator = require('./comparator.js'),
    _ = require('lodash-node'),
    walk = require('walkdir'),
    Path = require('path'),
    async = require('async'),
    queue = require('queue');

module.exports.traverse = function(tree, callback) {

  var analysis = {};
  var emitter = walk(tree);
  var diffQ = queue();

  emitter.on('file',function(filename, stat) {

    var relative = Path.relative(tree, filename);
    console.log('file from emitter: ', relative);

    var parts = relative.split('/');
    var platform = parts[0],
        browser = parts[1],
        version = parts[2],
        screenshot = parts[3];

    if (!analysis[platform]) {
      analysis[platform] = {};
    }

    if (!analysis[platform][browser]) {
      analysis[platform][browser] = {};
    }

    if (!analysis[platform][browser][version]) {
      analysis[platform][browser][version] = [];
    }

    var image = {
      path: relative,
      name: screenshot
    };

    diffQ.push(function(callback) {

      comparator.comp(image, function(err, diff) {

        if (err) {
          console.error(err);
        }

        analysis[platform][browser][version].push({
          filename: screenshot,
          diff: diff
        });

        callback();

      });

    });

  });

  emitter.on('end', function() {
    diffQ.start();
  });

  diffQ.on('end', function() {
    callback(null, analysis);
  });

}
