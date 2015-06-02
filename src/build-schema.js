var mongoose = require('mongoose');

var schema = mongoose.Schema({
  owner: String,
  previous: String,
  build: String,
  state: [{
    platform: String,
    browser: String,
    version: String,
    comparisons: [{
      match: Boolean,
      difference: String
    }]
  }]
});

mongoose.model('Build', schema);
