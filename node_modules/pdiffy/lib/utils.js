module.exports = {
  noop: function() {},
  isUrl: function(string) {
    return /http(s)?:\/\//.test(string);
  }
}
