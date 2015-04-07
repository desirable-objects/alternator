var _ = require("lodash");
var webshot = require("webshot");
var async = require("async");
var fs = require("fs");
var PNGDecoder = require("png-js");
var PNG = require("pngjs").PNG;
var status = require("./console");
var Shot = require("./Shot");
var Session = require("./Session");
var clc = require("cli-color");
var difference = require("./difference");
var utils = require("./utils");
var noop = utils.noop;
var pluginParser = require("./pluginParser");

var capture = function(config, callback) {
  config.options = config.options || {};

  var processCapture = function(capture, callback) {
    var results = {}; 
    var options = _.extend(_.clone(config.options), (capture.options || {}));
    var differenceFlag = _.isArray(capture.url);
    var shots = differenceFlag ? capture.url : [capture.url];
    var userScript = _.isFunction(options.script) ? options.script : noop;

    async.map(shots, function(url, cb) {
      var imageData = "";
      var imageBuffer = new Buffer(0);

      status.exec(clc.magenta("capturing: ") + url);

      if (options.plugins) {
        status.info(clc.green("plugins: ") + _.keys(options.plugins).join(", "));
      }

      options.script = pluginParser.parse(options.plugins, userScript);

      webshot(url, options, function(err, stream) {
        if (err) throw err;

        stream.on('data', function(data) {
          imageData += data.toString('base64');
          imageBuffer = Buffer.concat([imageBuffer, data]);
        });

        stream.on('end', function() {

          status.done(clc.magenta("capturing: ") + url);

          cb(null, new Shot({
            path: "data:image/png;base64," + imageData,
            displayURL: url,
            imageBuffer: imageBuffer
          }));
        });
      });
    }, function(err, results) {
      if (err) throw err;

      if (differenceFlag) {
        performDiff(results, capture, function(results) {
          callback(err, results);
        });	
      } else {
        callback(err, results); 
      }
    });
  };

  async.map(config.captures, processCapture, function(err, results) {
    var session = new Session();

    // Concat all our shots together
    results.forEach(function(shotArray) {
      session.shots.push.apply(session.shots, shotArray);
    });

   (callback || noop)(session);
  });
};

var performDiff = function(results, capture, callback) {
  capture = capture || {};

  async.map(results, function(shot, cb) {
    status.exec(clc.magenta("parsing: ") + shot.displayURL);

    var png = new PNGDecoder(shot.imageBuffer);
/*
    png.on('parsed', function() {
      cb(null, this);
    });

    png.on('error', function(err) {
      throw err;
    });

    png.parse(shot.imageBuffer);*/

    png.decode(function(pixels) {
      status.done(clc.magenta("parsing: ") + shot.displayURL);
      cb(null, {
        height: png.height,
        width: png.width,
        data: pixels
      });
    });

  }, function(err, pngs) {
    var width = _(pngs).pluck("width").max().value();
    var height = _(pngs).pluck("height").max().value();

    var diffPng = new PNG({
      width: width,
      height: height,
      filterType: -1
    });

    // This makes all PNGS the same size when comparing
    var buffers = pngs.map(function(buf) {
      var png = new PNG({
        width: width,
        height: height,
        filterType: -1
      });

      png.bitblt.call(buf, png, 0, 0, buf.width, buf.height, 0, 0);

      return {data: png};
    });

    var diffData = difference.compute({
      id: _.uniqueId(),
      mode: capture.mode || "block",
      threshold: 0,
      imageData: buffers,
      contextData: diffPng,
      startY: 0,
      block: height
    });

    var diffBuffer = new Buffer(0);

    diffPng.on('data', function(data) {
      diffBuffer = Buffer.concat([diffBuffer, data]);
    });

    diffPng.on('error', function(err) {
      throw err;
    });

    diffPng.on('end', function() {
      var diffShot = new Shot({
        path: "data:image/png;base64," + diffBuffer.toString("base64"),
        displayURL: "Difference",
        data: diffData.stats,
        type: Shot.DIFFERENCE
      });

      results.push(diffShot);
      callback(results, diffShot);
    });

    diffPng.pack();
  });
};

var compare = function(options) {
  async.map(options.paths, function(path, callback) {
    if (utils.isUrl(path)) {
      capture({options: options.captureOptions, captures: [{url: path}]}, function(session) {
        callback(null, session.shots[0]);
      });
    } else {
      if (!fs.existsSync(path)) {
        throw new Error("file does not exist!");
      }

      var buffer = fs.readFileSync(path);

      callback(null, {
        displayURL: path,
        imageBuffer: buffer
      });
    }
  }, function(err, results) {
    performDiff(results, options.diffOptions, function(shots, diffShot) {
      if (options.output) {
				status.info(clc.green("file written to ") + clc.cyan(options.output));
        fs.writeFileSync(options.output, diffShot.path.replace(/^data:image\/png;base64,/,""), "base64") 
      }

      options.callback(diffShot);
    });
  });
};

module.exports.performDiff = performDiff;
module.exports.capture = capture;
module.exports.compare = compare;
