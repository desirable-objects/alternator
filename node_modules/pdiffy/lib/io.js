var fs = require("fs");
var utils = require("./utils");
var status = require("./console");
var clc = require("cli-color");

var removeBuffers = function(results) {
  results.forEach(function(result) {
    delete result.imageBuffer;
  });
};

var writeSession = function(config, session, callback) {
  var timestamp = (config.schedule || config.interval || config.timestamp) && config.timestamp !== false;
  var output = config.output;
  // Add a timestamp for scheduled tasks unless timestamp is false in config
  if (timestamp) {
    output = output.replace(".pdiffy", "." + Date.now() + ".pdiffy");
  }

  removeBuffers(session.shots);

  fs.writeFile(output, session['export'](), function(err) {
    if (err) throw err;
    status.info(clc.green("session written to ") + output);
    (callback || utils.noop)(session);
  });
};

module.exports.writeSession = writeSession;
