'use strict';

var path = require('path');

var createConfigurator = require('../lib/create-configurator'),
    listCompositions   = require('../lib/list-compositions');

// TODO doctag
function app(options) {

  // there may be any number of compositions in subdirectories
  return listCompositions(options.appDir)
    .map(eachComposition);

  function eachComposition(composition, i) {
    var buildDir = path.join(options.buildDir, composition.directory),
        config   = createConfigurator({
          addCommon      : require('./add/common'),
          addBrowserSync : require('./add/browser-sync'),
          addClean       : require('./add/clean'),
          addComposition : require('./add/composition'),
          addConditionals: require('./add/conditionals'),
          addMinification: require('./add/minification')
        })
          .addCommon(path.resolve(__dirname, '..', 'node_modules'), options.globals)
          .addClean(buildDir)
          .addComposition(composition)
          .addConditionals({
            TEST   : false,
            DEBUG  : true,
            RELEASE: false
          })
          .addMinification(!options.unminified)
          .merge({
            output: {
              path: path.resolve(buildDir)
            }
          });

    // we only need to create a server for the base composition
    return (i === 0) ? config.addBrowserSync(buildDir, options.port) : config;
  }
}

module.exports = app;