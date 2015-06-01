var Hapi = require('hapi'),
    Path = require('path'),
    config = require('config'),
    tree = require('dir-to-json'),
    sf = require('sf'),
    Joi = require('joi'),
    async = require('async'),
    navigator = require('./src/fs-navigator.js'),
    _ = require('lodash-node'),
    Boom = require('boom'),
    uploader = require('./src/uploader'),
    fs = require('fs'),
    comparator = require('./src/comparator'),
    Build;

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

var db = require('./src/db')(function() {
  console.log('Connected to DB');
  Build = require('mongoose').model('Build');
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
  Build.findOne({owner: 'antony'}).sort('-_id').exec(function(err, doc) {

    if (err || !doc) {
      console.error(err || 'Document not found');
      return reply().code(404);
    }

    reply(doc);

  });
}

server.route({

  method: 'POST',
  path: '/api/compare/{build}/{platform}/{browser}/{version}',
  config: {
    pre: [
      {method: fetchLastBuild, assign: 'previous'}
    ],
    validate: {
      params: {
        platform: Joi.string().required().description('Platform Name'),
        browser: Joi.string().required().description('Browser Name'),
        version: Joi.string().required().description('Browser Version'),
        build: Joi.string().required().description('Build ID')
      },
      payload: {
        assets: Joi.string().required().description('Url to the screenshots for analysis.')
      }
    }
  },
  handler: function (request, reply) {

    var metadata = _.defaults(request.params, {
      owner: 'antony',
      previous: request.pre.previous ? request.pre.previous.metadata.build : 'initial',
      currentDir: null,
      previousDir: null
    });

    uploader.upload(metadata, request.payload.assets, function(err, metadata) {

      fs.readdir(metadata.currentDir, function(err, files) {

        if (err) {
          console.error('Could not read files', metadata);
          return reply(Boom.internal());
        }

        async.map(files, function(image, callback) {

          comparator.compare(metadata, image, function(err, result) {
            console.log(result);
            callback(err, result);
          });

        }, function(err, analysis) {

            if (err) {
              console.error('Could not process comparison on files', metadata);
              return reply(Boom.internal());
            }

            var doc = new Build({
              owner: metadata.owner,
              metadata: metadata,
              state: analysis
            });

            doc.save(function(err, newDoc) {
              return reply(analysis);
            });

        });

      })

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
