describe("Shot.js", function() {
  var Shot = require(__dirname + "/../../lib/Shot");
  var _ = require("lodash");

  it("should create a new Shot instance", function() {
    var shot = new Shot();

    expect(shot.id).toBeDefined();
    expect(shot instanceof Shot).toBe(true);
  });

  it("should reset the screen position", function() {
    var shot = new Shot();

    shot.screenPosition.x = 200;
    shot.screenPosition.y = 200;

    shot.resetPosition();

    expect(shot.screenPosition.x).toBe(0);
    expect(shot.screenPosition.y).toBe(0);
  });

  it("should set the opacity", function() {
    var shot = new Shot();

    expect(shot.screenOpacity).toBe(1);
    shot.setOpacity(0);
    expect(shot.screenOpacity).toBe(0);
  });

  it("should export the shot", function() {
    var shot = new Shot();

    expect(_.isObject(shot.export())).toBe(true);
  });
});
