describe("schedule.js", function() {

  var schedule = require(__dirname + "/../../lib/schedule");
  var capture = require(__dirname + "/../../lib/capture");
  var nodeSchedule = require("node-schedule");
  var fs = require("fs");
  var config = {
    captures: [{url: "http://google.com"}]
  };

  it("should run a job once", function(done) {
    config.output = __dirname + "/../tmp/run.pdiffy";

    schedule.run(config, function() {
      expect(fs.existsSync(config.output)).toBe(true);
      done();
    });
  });

  it("should run a job schedule", function(done) {
    config.schedule = {minutes: 0};
    config.output = __dirname + "/../tmp/runSchedule.pdiffy";
    spyOn(nodeSchedule, "scheduleJob");

    schedule.run(config);
    expect(nodeSchedule.scheduleJob).toHaveBeenCalled(); 
    done();
  });

  it("should run a job at an interval", function(done) {
    delete config.schedule;
    config.interval = 0;
    config.output = __dirname + "/../tmp/runInterval.pdiffy";
    jasmine.Clock.useMock();

    schedule.run(config, function() {
      expect(fs.existsSync(config.output)).toBe(true);
      done();
    });

    jasmine.Clock.tick();
  });


});
