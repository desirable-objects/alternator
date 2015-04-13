var mongoose = require('mongoose');

var schema = mongoose.Schema({
  owner: String,
  metadata: {
    owner: String,
    previous: String,
    build: String,
    currentDir: String,
    previousDir: String
  },
  state: Object
});

mongoose.model('Build', schema);
