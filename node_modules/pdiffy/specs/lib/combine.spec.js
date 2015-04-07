describe("combine.js", function() {

  var combine = require(__dirname + "/../../lib/combine").combine;
  var fs = require("fs");
  var fixtures = __dirname + "/../fixtures";
  var output = __dirname + "/../tmp/combineSession.json";
  var sessions = [
    fixtures + "/session1.json",
    fixtures + "/session2.json"
  ];

  it("should combine both session's shots", function(done) {
    combine(sessions, output, function(session) {
      expect(session.shots[0].path).toBe("myPath1");
      expect(session.shots[1].path).toBe("myPath2");

      expect(fs.existsSync(output)).toBe(true);

      var file = require(output);

      expect(file.shots[0].path).toBe("myPath1");
      expect(file.shots[1].path).toBe("myPath2");

      done();
    });

  });

});
