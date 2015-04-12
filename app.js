var Hapi = require('hapi'),
    Path = require('path'),
    config = require('config'),
    tree = require('dir-to-json'),
    sf = require('sf'),
    Joi = require('joi'),
    async = require('async'),
    navigator = require('./src/fs-navigator.js'),
    Datastore = require('nedb'),
    _ = require('lodash-node'),
    Boom = require('boom'),
    uploader = require('./src/uploader'),
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
      path: sf(config.workDir, {owner: 'antony'}),
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
    config: {
      pre: [
        {method: fetchLastBuild, assign: 'lastBuild'}
      ]
    },
    handler: function (request, reply) {

      if (!request.pre.lastBuild) {
        return reply.view('dashboard', {message: {severity: 'warning', content: '<b>Oops!</b> You have not published any builds yet! Read the getting started documentation.'}}, {layout: 'layout'});
      }

      reply.view('dashboard', {screenshots: request.pre.lastBuild.state}, {layout: 'layout'});
    }
});

server.route({
  method: 'GET',
  path: '/zoom/{platform}/{browser}/{version}/{image}',
  config: {
    pre: [
      {method: fetchLastBuild, assign: 'lastBuild'}
    ]
  },
  handler: function (request, reply) {

    var platform = request.params.platform.toUpperCase();
    var environment = request.pre.lastBuild.state[platform][request.params.browser][request.params.version];
    var image = _.find(environment, {diff: {name: request.params.image}});

    reply.view('zoom', {image: image});

  }
});

function fetchLastBuild(request, reply) {
  db.findOne({owner: 'antony'}, function(err, doc) {

    if (err || !doc) {
      console.error(err || 'Document not found');
      return reply().code(404);
    }

    reply(doc);

  });
}

server.route({

  method: 'POST',
  path: '/api/compare/{build}',
  config: {
    pre: [
      {method: fetchLastBuild, assign: 'previous'}
    ],
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

    var metadata = {
      owner: 'antony',
      previous: request.pre.previous ? request.pre.previous.metadata.build : 'initial',
      build: request.params.build,
      currentDir: null,
      previousDir: null
    };

    var assets = request.payload.assets;
    uploader.upload(metadata, assets, function(err, metadata) {

      var current = tree(metadata.currentDir);

      current.then(function (tree) {

        navigator.traverse(metadata, function(err, analysis) {

          var doc = {
            owner: metadata.owner,
            metadata: metadata,
            state: analysis
          }

          db.insert(doc, function(err, newDoc) {
            return reply(analysis);
          });

        });

      });

    });

  }

});

server.route({
    method: 'GET',
    path: '/changes/{platform}/{browser}/{version}',
    config: {
      pre: [
        {method: fetchLastBuild, assign: 'lastBuild'}
      ]
    },
    handler: function (request, reply) {

      var lastBuild = request.pre.lastBuild,
          buildState = _.assign(lastBuild.metadata, request.params);

      var platform = request.params.platform.toUpperCase(),
        environment = sf('Differences for {browser} {version} on {platform} between build {previous} -> {current}', buildState),
        lastBuildThumbs = lastBuild.state[platform][request.params.browser][request.params.version];

        console.log(lastBuild);
      reply.view('thumbnails', {currentBuild: lastBuild.metadata.build, environment: environment, thumbnails: lastBuildThumbs}, {layout: 'layout'});


    }
});

server.register(require('bell'), function (err) {

  server.auth.strategy('github', 'bell', {
    provider: 'github',
    password: 'vile&evil',
    clientId: '2732fc45e6bd422478db',
    clientSecret: '6450805b2f0a07d436852be91cd771f1b3f03f0b'
  });

  server.route({
    method: ['GET', 'POST'],
    path: '/login',
    config: {
      auth: 'github',
      handler: function (request, reply) {
        return reply.redirect('/');
      }
    }
  });

  server.start();
});
