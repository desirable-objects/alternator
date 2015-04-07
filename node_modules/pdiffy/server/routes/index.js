'use strict';

var app = require("./../server").app;

app.get("/", function(req, res) {
  res.sendfile("app/index.html");
});

