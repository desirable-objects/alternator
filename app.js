var Hapi = require('hapi'),
    Path = require('path'),
    config = require('config'),
    _ = require('lodash-node'),
    tree = require('dir-to-json'),
    sf = require('sf');

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

      var screenshots = tree(config.screenshots);

      screenshots.then(function (tree) {
          reply.view('index', {screenshots: tree});
      });

    }
});

server.route({
    method: 'GET',
    path: '/compare/{platform}/{browser}',
    handler: function (request, reply) {

      var screenshots = tree(sf('{screenshots}/{platform}/{browser}', {
        screenshots: config.screenshots,
        platform: request.params.platform,
        browser: request.params.browser
      }));

      screenshots.then(function (tree) {
          reply.view('index', {screenshots: thumbnails});
      });

    }
});

server.start();
