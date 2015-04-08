var Hapi = require('hapi'),
    Path = require('path'),
    config = require('config'),
    _ = require('lodash-node'),
    tree = require('dir-to-json'),
    sf = require('sf'),
    imageDiff = require('image-diff'),
    datauri = require('datauri'),
    async = require('async');

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

      var analysis = {};

      current.then(function (tree) {

        _.each(tree.children, function(platform) {
          analysis[platform.name] = {};
          _.each(platform.children, function(browser) {
            analysis[platform.name][browser.name] = {};
            _.each(browser.children, function(version) {
              analysis[platform.name][browser.name][version.name] = [];
              _.each(version.children, function(image) {

                var diff = {};

                var imagePath = sf('/{platform}/{browser}/{version}/{image}', {
                  platform: platform.name,
                  browser: browser.name,
                  version: version.name,
                  image: image.name
                });

                var diffImage = '/tmp/'+image.name;

                var result = imageDiff({
                  actualImage: currentDir + imagePath,
                  expectedImage: previousDir + imagePath,
                  diffImage: diffImage
                }, function (err, imagesAreSame) {

                  if (err) {
                    console.error(err);
                    return
                  }

                  diff.name = image.name;
                  diff.match = imagesAreSame;
                  if (!imagesAreSame) {
                    diff.difference = datauri(diffImage);
                  }

                  analysis[platform.name][browser.name][version.name].push(diff);

                  reply(analysis);

                });
              });
            });
          });
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
