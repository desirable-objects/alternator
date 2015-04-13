var mongoose = require('mongoose');
var db = mongoose.connection;

require('./build-schema');

module.exports = function(callback) {

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', callback);

  mongoose.connect('mongodb://localhost/alternator');
}
