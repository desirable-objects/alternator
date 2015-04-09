var comparator = require('./comparator.js'),
    _ = require('lodash-node');

module.exports.traverse = function(tree, callback) {

  var analysis = {},
      comparisonCount = 0,
      comparisonsPerformed = 0;

  _.each(tree.children, function(platform) {
    analysis[platform.name] = {};
    _.each(platform.children, function(browser) {
      analysis[platform.name][browser.name] = {};
      _.each(browser.children, function(version) {
        analysis[platform.name][browser.name][version.name] = [];
        comparisonCount += version.children.length;
        _.each(version.children, function(image) {
          console.log('ddde');
          comparator.comp(image, function(err, diff) {

            console.log(arguments);
            if (err) {
              console.error(err);
            }

            analysis[platform.name][browser.name][version.name].push(diff);
            comparisonsPerformed += 1;

            console.log(comparisonsPerformed, comparisonCount);

            if (comparisonCount == comparisonsPerformed) {
              callback(null, analysis);
            }

          });

        });
      });
    });
  });
}
