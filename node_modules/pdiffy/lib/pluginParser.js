var _ = require("lodash");
var fs = require("fs");

var wrap = function(fn, params) {
  return "(" + fn.toString() + "(" + JSON.stringify(params) + "));";
};

var parse = function(plugins, userScript) {

  var outputCode = "function() {\n";

  var pluginStrings = _.map(plugins, function(params, pluginName) {
    var fn = require(__dirname + "/plugins/" + pluginName + ".js");

    return wrap(fn, params);
  });

  userScript && pluginStrings.push(wrap(userScript, {}));

  return outputCode += pluginStrings.join("\n") + "\n}";
};

module.exports = {
  parse: parse,
  wrap : wrap
};
