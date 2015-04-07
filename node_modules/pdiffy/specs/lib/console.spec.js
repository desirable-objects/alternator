describe("console.js", function() {
  var status = require(__dirname + "/../../lib/console");
  var clc = require("cli-color");
  var cyan = clc.cyan;
  var magenta = clc.magenta;

  beforeEach(function() {
    spyOn(console, "log").andCallThrough();
  });

  it("should output an execute command", function() {
    status.exec("test");
    expect(console.log).toHaveBeenCalledWith(cyan("pdiffy ") + magenta("EXEC") + " test");
  });
  
  it("should output a warning", function() {
    status.warn("test");
    expect(console.log).toHaveBeenCalledWith(cyan("pdiffy ") + clc.bgYellow.black("WARN") + " test");
  });

  it("should output an error", function() {
    status.error("test");
    expect(console.log).toHaveBeenCalledWith(cyan("pdiffy ") + clc.bgRed.black("ERR!") + " test");
  });

  it("should output an info message", function() {
    status.info("test");
    expect(console.log).toHaveBeenCalledWith(cyan("pdiffy ") + clc.blue("INFO") + " test");
  });

  it("should output a done message", function() {
    status.done("test");
    expect(console.log).toHaveBeenCalledWith(cyan("pdiffy ") + clc.bgGreen.black("DONE") + " test");
  });

  it("should output a log message", function() {
    status.log("test");
    expect(console.log).toHaveBeenCalledWith(cyan("pdiffy ") + "test");
  });
});
