describe("pluginParser.js", function() {

  var pluginParser = require(__dirname + "/../../lib/pluginParser");
  var fs = require("fs");

  it("should wrap the function in an IIFE", function() {
    var expected = "(function () {}({\"test\":\"test\"}));";
    expect(pluginParser.wrap(function() {}, {test: "test"})).toBe(expected);
  });

  it("should return a wrapped version of all plugins", function() {
    var plugin1 = require(__dirname + "/../../lib/plugins/hideElements");

    var expected = "function() {\n" + pluginParser.wrap(plugin1, ["body"]) + "\n}";

    expect(pluginParser.parse({hideElements: ["body"]})).toBe(expected);
  });
});
