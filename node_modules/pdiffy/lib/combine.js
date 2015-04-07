var clc = require("cli-color");
var _ = require("lodash");
var io = require("./io");
var fs = require("fs");
var utils = require("./utils");
var status = require("./console");
var Session = require("./Session");
var Shot = require("./Shot");

module.exports.combine = function(sessionPaths, output, callback) {
  var error = null;
  callback = callback || utils.noop;

  var sessions = sessionPaths.map(function(session) {
    if (!fs.existsSync(session)) {
      error = "session file does not exist! - " + session;
      return;
    }

    return new Session(JSON.parse(fs.readFileSync(session), 'utf8'));
  });

  if (error !== null) {
    throw new Error(error);
  }

  status.exec(clc.green.underline("combining sessions:"));

  sessionPaths.forEach(function(path) {
    status.log("- " + path);
  });

  var shots = _(sessions)
    .pluck("shots")
    .flatten()
    .map(function(shot) {
      return new Shot(shot);
    })
    .value()
    .reverse(); // For some reason shots are getting added in reverse

  var newSession = new Session({shots: shots});

  io.writeSession({
    output: output 
  }, newSession, callback);
  
};
