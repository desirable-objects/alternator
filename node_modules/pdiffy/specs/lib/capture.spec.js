describe("capture.js", function() {
  var capture = require(__dirname + "/../../lib/capture");
  var Shot = require(__dirname + "/../../lib/Shot");
  var fs = require("fs");

  jasmine.getEnv().defaultTimeoutInterval = 20000;

  it("should capture a screen shot", function(done) {
    var config = {
      captures: [{url: "http://google.com"}]
    };

    capture.capture(config, function(session) {
      expect(session).toBeDefined();
      expect(session.shots).toBeDefined();
      expect(session.shots[0].path).toBeDefined();
      done();
    });
  });

  it("should capture the screen shots and perform a difference", function(done) {
    var config = {
      captures: [{url: ["http://google.com", "http://yahoo.com"]}]
    };

    capture.capture(config, function(session) {
      expect(session).toBeDefined();
      expect(session.shots).toBeDefined();

      expect(session.shots.length).toBe(3);
      expect(session.shots[2].type).toBe(Shot.DIFFERENCE);
      done();
    });
  });

  it("should compare screen shots and output an image file", function(done) {
    var output = __dirname + "/../tmp/compare.png";

    capture.compare({
      output: output,
      paths: [__dirname + "/../fixtures/Google.png", "http://google.com"],
      callback: function(img) {
        expect(img instanceof Shot).toBe(true);
        expect(fs.existsSync(output)).toBe(true);
        done();
      }
    });
  });

});
