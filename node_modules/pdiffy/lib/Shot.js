
(function(_) {
  var isServer = typeof module !== 'undefined';
  var _ = isServer ? require('lodash') : window._;
  var exportProps = ['id', 'show', 'data', 'path', 'displayURL', 'height'
    , 'width', 'screenAnimateTime', 'screenAnimate', 'screenPosition'
    , 'screenPosition', 'screenOpacity', 'selectedForDifference'];

  var Shot = function(options) {
      this.id = _.uniqueId();
      this.show = true;
      this.data = {
        numberOfSamePixels: 0,
        numberOfDifferentPixels: 0,
        totalPixels: 0
      };
      this.displayURL = "";
      this.height = 0;
      this.width = 0;
      this.buffers = [];
      this.path = "";
      this.type = Shot.SOURCE;
      this.screenAnimateTime = 1;
      this.screenAnimate = false;
      this.screenPosition = {x: 0, y: 0 };
      this.screenOpacity = 1;
      this.selectedForDifference = false;
      this.canvasContext = null;

      _.extend(this, options);
  };

  Shot.prototype = {
    resetPosition: function() {
      this.screenPosition.x = 0;
      this.screenPosition.y = 0;
    },
    setOpacity: function(val) {
      this.screenOpacity = val;
    },
    'export': function() {
      return _.pick(this, exportProps);
    }
  };

  Shot.SOURCE = 0;
  Shot.DIFFERENCE = 1;

  if (isServer) {
    module.exports = Shot;
  } else {
    this.Shot = Shot;
  }

}());
