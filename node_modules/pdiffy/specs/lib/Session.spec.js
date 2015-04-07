describe("Session.js", function() {
  var Session = require(__dirname + "/../../lib/Session");

  it("should create a new session", function() {
    var session = new Session();

    expect(session.shots.length).toBe(0);
    expect(session instanceof Session).toBe(true);
  });

  it("should create a new session with options", function() {
    var session = new Session({
      shots: [{}]
    });

    expect(session.shots.length).toBe(1);
  });

  it("should export the session", function() {
    var session = new Session({
      id: 1,
      name: "Session 1"
    });

    expect(session.export()).toBe('{"id":1,"name":"Session 1","shots":[]}');
  });

  it("should add a shot", function() {
    var session = new Session();

    session.addShot({});

    expect(session.shots.length).toBe(1);
  });

  it("should set the name of the session", function() {
    var session = new Session();

    session.setName("My Session");

    expect(session.name).toBe("My Session");
  });

  it("should remove a shot", function() {
    var shot1 = {};
    var shot2 = {};
    var session = new Session({
      shots: [shot1, shot2]
    });

    session.removeShot(shot2);

    expect(session.shots.length).toBe(1);
    expect(session.currentShot).toBe(shot1);

    session.removeShot(shot1);

    expect(session.shots.length).toBe(0);
    expect(session.currentShot).toBe(null);
  });

  it("should grab the correct shot by id", function() {
    var shot1 = {id: 1};
    var shot2 = {id: 2};
    var session = new Session({
      shots: [shot1, shot2]
    });

    expect(session.getShotById(1)).toBe(shot1);
    expect(session.getShotById(2)).toBe(shot2);
  });

  it("should grab the max height", function() {
    var shot1 = {height: 500};
    var shot2 = {height: 300};
    var session = new Session({
      shots: [shot1, shot2]
    });

    expect(session.getMaxHeight()).toBe(500);
  });

  it("should grab the max width", function() {
    var shot1 = {width: 500};
    var shot2 = {width: 300};
    var session = new Session({
      shots: [shot1, shot2]
    });

    expect(session.getMaxWidth()).toBe(500);
  });

  it("should set the current shot", function() {
    var shot1 = {id: 1};
    var shot2 = {id: 2};
    var session = new Session({
      shots: [shot1, shot2]
    });

    session.setCurrentShot(shot1);
    expect(session.currentShot).toBe(shot1);
    expect(session.currentTab).toBe(1);

    session.setCurrentShot(shot2);
    expect(session.currentShot).toBe(shot2);
    expect(session.currentTab).toBe(2);
  });

  it("should move to the shot at index", function() {
    var shot1 = {};
    var shot2 = {};
    var session = new Session({
      shots: [shot1, shot2]
    });

    session.moveToShot(1);
    expect(session.currentShot).toBe(shot2);
    session.moveToShot(0);
    expect(session.currentShot).toBe(shot1);
    session.moveToShot(10);
    expect(session.currentShot).toBe(shot1);
  });

  it("should return the current shot index", function() {
    var shot1 = {};
    var shot2 = {};
    var session = new Session({
      shots: [shot1, shot2]
    });

    session.setCurrentShot(shot2);
    expect(session.getActiveSetIndex()).toBe(1);
  });
});
