(function() {
  var exportProps = ['id', 'name'];
  var isServer = typeof module !== 'undefined';
  var _ = isServer ? require('lodash') : window._;
  
  var Session = function(options) {
      this.shots = [];
      this.source = null;
      this.id = _.uniqueId();
      this.currentTab = null;
      this.currentShot = null;
      this.name = "Session " + this.id;

      _.extend(this, options);
  };

  Session.prototype = {
    'export': function() {
      var file = _.pick(this, exportProps);
      file.shots = _.map(this.shots, function(shot) {
        return shot.export();
      });

      return JSON.stringify(file);
    },
    addShot: function(shot) {
      this.shots.push(shot);
    },
    setName: function(name) {
      this.name = name;
    },
    removeShot: function(shot) {
      var index = this.shots.indexOf(shot);
      var isLast = index === this.shots.length - 1;

      _.pull(this.shots, shot);

      if (this.shots.length > 0) {
        this.setCurrentShot(isLast ? this.shots[index - 1] : this.shots[index]);
      } else {
        this.currentShot = null;
      }
    },
    getShotById: function(id) {
      return _.find(this.shots, function(shot) {
        return shot.id === id;
      });
    },
    getMaxHeight: function() {
      return this.shots.length > 0 
        ? _(this.shots).pluck("height").max().value()
        : 0;
    },
    getMaxWidth: function() {
      return this.shots.length > 0 
        ? _(this.shots).pluck("width").max().value()
        : 0;
    },
    setCurrentShot: function(shot) {
      this.currentTab = shot.id;
      this.currentShot = shot;
    },
    moveToShot: function(index) {
      if (index < this.shots.length && index >= 0) {
        this.setCurrentShot(this.shots[index]);
      }
    },
    getActiveSetIndex: function() {
      return this.shots.indexOf(this.currentShot);
    }
  };

  if (isServer) {
    module.exports = Session;
  } else {
    this.Session = Session;
  }

}());
