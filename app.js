var Hapi = require('hapi'),
    Path = require('path'),
    config = require('config'),
    tree = require('dir-to-json'),
    sf = require('sf'),
    fs = require('fs'),
    Joi = require('joi'),
    fstream = require('fstream'),
    unzip = require('unzip'),
    async = require('async'),
    navigator = require('./src/fs-navigator.js'),
    Datastore = require('nedb'),
    _ = require('lodash-node'),
    Boom = require('boom'),
    httpClient = require('request');
    db = new Datastore();

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(__dirname, 'src/public/views'),
    layoutPath: Path.join(__dirname, 'src/public/layouts'),
    helpersPath: Path.join(__dirname, 'src/handlebars-helpers')
});

server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
        directory: {
            path: 'src/public/assets',
            listing: true
        }
    }
});

server.route({
  method: 'GET',
  path: '/s3/{param*}',
  handler: {
    directory: {
      path: 'test/current',
      listing: true
    }
  }
});

server.route({
  method: 'GET',
  path: '/fixture/archive/{param*}',
  handler: {
    directory: {
      path: 'test',
      listing: true
    }
  }
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

      db.findOne({owner: 'antony'}, function(err, doc) {

        if (err || !doc) {
          console.error(err || 'Document not found');
          reply().code(404);
        }

        reply.view('dashboard', {screenshots: doc.state}, {layout: 'layout'});
      });

    }
});

server.route({
  method: 'GET',
  path: '/zoom/{platform}/{browser}/{version}/{image}',
  handler: function (request, reply) {

    db.findOne({owner: 'antony'}, function(err, doc) {

      if (err || !doc) {
        console.error(err || 'Document not found');
        reply().code(404);
      }

      var platform = request.params.platform.toUpperCase();
      var environment = doc.state[platform][request.params.browser][request.params.version];
      var image = _.find(environment, {diff: {name: request.params.image}});

      reply.view('zoom', {image: image});
    });

  }
});

server.route({

  method: 'POST',
  path: '/api/compare/{build}',
  config: {
    validate: {
      params: {
        build: Joi.string().required().description('Build ID')
      },
      payload: {
        assets: Joi.string().required().description('Url to the screenshots for analysis.')
      }
    }
  },
  handler: function (request, reply) {

    var outDir = '/tmp/antony/'+request.params.build;
    fs.mkdir(outDir, function() {

      var writeStream = fstream.Writer(outDir);
      writeStream.on('close', function() {
        return reply().code(200);
      });

      httpClient(request.payload.assets).pipe(unzip.Parse()).pipe(writeStream);
    });

  }

})

server.route({
    method: 'GET',
    path: '/api/compare',
    handler: function (request, reply) {

      var currentDir = config.screenshots+'/current';
      var previousDir = config.screenshots+'/previous';
      var current = tree(currentDir);

      current.then(function (tree) {

        navigator.traverse(currentDir, function(err, analysis) {

          var doc = {
            owner: 'antony',
            state: analysis
          }

          db.insert(doc, function(err, newDoc) {
            reply(analysis);
          });

        });

      });

    }
});

server.route({
    method: 'GET',
    path: '/changes/{platform}/{browser}/{version}',
    handler: function (request, reply) {

      db.findOne({owner: 'antony'}, function(err, doc) {

        if (err || !doc) {
          console.error(err || 'Document not found');
          return reply().code(404);
        }

        var platform = request.params.platform.toUpperCase(),
            environment = sf('Differences for {browser} {version} on {platform}', request.params);

        reply.view('thumbnails', {environment: environment, thumbnails: doc.state[platform][request.params.browser][request.params.version]}, {layout: 'layout'});
      });

    }
});

var dummy = {
  owner: 'antony',
  state: {"LINUX":{"firefox":{"37_0":[{"filename":"browser.png","path":"LINUX/firefox/37_0/browser.png","diff":{"match":false,"name":"browser.png","difference":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABPwAAAPkAgMAAABAccgdAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlQTFRF/////wAA////miskgwAAAAF0Uk5TzNI0Vv0AAAABYktHRACIBR1IAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAB3UlEQVR42u3WMW6EMBAFUFz4BvF9NgU9K83c/yoZAUmRatkUFsp7jTHV15dhvCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACU6I/jYcS+fG95STv6a9sSY3+hv0tanv217WhOf5e0tWePyKgT2GNsmWvMznQnfV0zR2Sdv2XU+qzd7Ex3Uv19nv3tPervmpE//fWzv5yd6U5Gy9/9zY50Kx9LHv+/ur/4fq+L6q/mbkbdn83fv6sxzPvac5sd4d7yMTsBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwHXx5tJprwZChfAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE1LTA0LTEwVDIwOjM3OjAwKzAxOjAwfdKwHgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNS0wNC0xMFQyMDozNzowMCswMTowMAyPCKIAAAAASUVORK5CYII="}},{"filename":"number2.png","path":"LINUX/firefox/37_0/number2.png","diff":{"match":false,"name":"number2.png","difference":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABPwAAAPkAgMAAABAccgdAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlQTFRF/////wAA////miskgwAAAAF0Uk5TzNI0Vv0AAAABYktHRACIBR1IAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAB3UlEQVR42u3WMW6EMBAFUFz4BvF9NgU9K83c/yoZAUmRatkUFsp7jTHV15dhvCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACU6I/jYcS+fG95STv6a9sSY3+hv0tanv217WhOf5e0tWePyKgT2GNsmWvMznQnfV0zR2Sdv2XU+qzd7Ex3Uv19nv3tPervmpE//fWzv5yd6U5Gy9/9zY50Kx9LHv+/ur/4fq+L6q/mbkbdn83fv6sxzPvac5sd4d7yMTsBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwHXx5tJprwZChfAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE1LTA0LTEwVDIwOjM3OjAwKzAxOjAwfdKwHgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNS0wNC0xMFQyMDozNzowMCswMTowMAyPCKIAAAAASUVORK5CYII="}},{"filename":"item3.png","path":"LINUX/firefox/37_0/item3.png","diff":{"match":true,"name":"item3.png"}}]}}}
};

db.insert(dummy, function(err, newDoc) {
  server.start();
});
