'use strict';

var path = require('path');

var createConfigurator = require('../lib/create-configurator'),
    listCompositions   = require('../lib/list-compositions');

// TODO doctag
function release(options) {
  var composition = listCompositions(options.appDir)[0];

  return [
    createConfigurator({
      addBrowserSync          : require('./add/browser-sync'),
      addClean                : require('./add/clean'),
      addCommon               : require('./add/common'),
      addComposition          : require('./add/composition'),
      addConditionals         : require('./add/conditionals'),
      addExternalChunkManifest: require('./add/external-chunk-manifest'),
      addMinification         : require('./add/minification')
    })
      .addBrowserSync(options.releaseDir, options.port)
      .addClean(options.releaseDir)
      .addComposition(composition)
      .addCommon(path.resolve(__dirname, '..', 'node_modules'), options.globals)
      .addConditionals({
        TEST   : false,
        DEBUG  : false,
        RELEASE: true
      })
      .addExternalChunkManifest()
      .addMinification(!options.unminified)
      .merge({
        output: {
          path      : path.resolve(options.releaseDir),
          publicPath: options.publicPath
        }
      })
  ];
}

module.exports = release;