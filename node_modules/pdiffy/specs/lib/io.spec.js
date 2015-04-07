describe("io.js" , function() {

  var io = require(__dirname + "/../../lib/io.js");
  var Session = require(__dirname + "/../../lib/Session.js");
  var fs = require("fs");
  var config = {
    output: __dirname + "/../tmp/writeSession.pdiffy"
  };

  it("should write a session file to disk", function(done) {
    io.writeSession(config, new Session(), function() {
      expect(fs.existsSync(config.output)).toBe(true);
      done();
    });
  });

});
