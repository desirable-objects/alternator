var lowercase = require('./lowercase');

module.exports = function(str) {
  var lower = lowercase(str);
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};
