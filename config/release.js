'use strict';

var path = require('path');

var listCompositions = require('../lib/list-compositions');

/**
 * Create a single webpack configurator for release.
 * @param {function} configuratorFactory A factory for the webpack-configurator
 * @param {{appDir:string, releaseDir:string, globals:object, unminified:boolean, port:number}} options An options hash
 * @returns {Config} A webpack configurator
 */
function release(configuratorFactory, options) {

  // only the primary application will be released
  var composition = listCompositions(options.appDir)[0];
  if (composition) {
    return configuratorFactory()
      .addBrowserSync(options.releaseDir, options.port)
      .addClean(options.releaseDir)
      .addComposition(composition)
      .addCommon(path.resolve(__dirname, '..', 'node_modules'), options)
      .addConditionals({
        TEST   : false,
        DEBUG  : false,
        RELEASE: true
      })
      .addExternalChunkManifest()
      .addMinification(!options.unminified)
      .merge({
        name  : 'release',
        output: {
          path      : path.resolve(options.releaseDir),
          publicPath: options.publicPath
        }
      });
  }
  else {
    throw new Error('there are no compositions in the app directory');
  }
}

module.exports = release;