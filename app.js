var Hapi = require('hapi'),
    Path = require('path'),
    config = require('config'),
    tree = require('dir-to-json'),
    sf = require('sf'),
    async = require('async'),
    navigator = require('./src/fs-navigator.js'),
    Datastore = require('nedb'),
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
    path: Path.join(__dirname, 'src/public'),
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
    path: '/',
    handler: function (request, reply) {

      var screenshots = tree(config.screenshots+'/current');

      screenshots.then(function (tree) {
          reply.view('index', {screenshots: tree});
      });

    }
});

server.route({
    method: 'GET',
    path: '/api/compare',
    handler: function (request, reply) {

      var currentDir = config.screenshots+'/current';
      var previousDir = config.screenshots+'/previous';
      var current = tree(currentDir);

      current.then(function (tree) {

        navigator.traverse(tree, function(err, analysis) {
          reply(analysis);
        });

      });

    }
});

server.route({
    method: 'GET',
    path: '/latest/{platform}/{browser}',
    handler: function (request, reply) {

      reply().code(404);

    }
});

server.start();
