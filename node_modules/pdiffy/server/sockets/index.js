'use strict';

// Main sockets object
var io = require( './../server' ).io;
var fs = require('fs');
var _ = require("lodash");
var path = require("path");
var capture = require("./../../lib/capture").capture;

// Connection route - bootstraps the other socket routes
io.sockets.on('connection', function( socket ) {

	socket.emit('send:onConnect', {
		message: 'Sockets Connected',
    data: {}
	});

  socket.on("send:takeShot", function(shot) {
    capture({captures: [shot]}, function(session) {
      socket.emit('data:end', {data: session.shots[0].path});
    });
  });

  socket.on("send:getConfig", function() {
    var config = fs.readFile(path.join(__dirname, "../config-defaults.json"), "utf8", function(err, data) {
      if (err) throw err;
      socket.emit("data:config", data);
    });
  });

  socket.on("send:saveConfig", function(config) {
/*    fs.writeFile("config.json", JSON.stringify(config, null, "\t"), function(err) {
      if (err) throw err;
    });*/
  });

});
