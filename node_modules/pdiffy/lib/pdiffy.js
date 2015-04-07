var capture = require("./capture");
var schedule = require("./schedule");
var combine = require("./combine");
var io = require("./io");

module.exports = {
  capture: capture.capture,
  compare: capture.compare,
  combine: combine.combine,
  run: schedule.run
};

module.exports.startServer = function() {
  return require("../server/server");
};
