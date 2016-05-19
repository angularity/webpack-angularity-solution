'use strict';

/**
 * Add support for legacy (browserify) angularity projects.
 * @param {Config} configurator A webpack-configurator instance
 * @param {{legacy:string}} options
 * @returns {Config} The given webpack-configurator instance
 */
function legacy(configurator, options) {

  // using legacy by default
  if (options.legacy !== false) {

    // lazy import packages
    var path            = require('path'),
        fs              = require('fs'),
        OmitTildePlugin = require('omit-tilde-webpack-plugin'),
        test            = require('../lib/test-file-path');

    /* jshint validthis:true */
    return configurator

      .plugin('omit-tilde', OmitTildePlugin, [{
        test     : /\.s?css$/,
        include  : ['package.json', 'bower.json'].filter(checkExists),
        deprecate: true
      }])

      // IMPORTANT:
      // * Must not process webpack loaders when encountered (e.g. css-loader)
      // * Specify the name of each loader in full (e.g. use 'css-loader' not 'css')
      //   otherwise you will get false matches (e.g. 'jshint' package will be confused with 'jshint-loader')
      //   this is mainly a problem ig you have sym-linked packages in your actual project

      .removeLoader('js')
      .loader('js', {
        test   : /\.js$/i,
        exclude: test.any(test.directory('bower_components'), test.nodeModule('webpack'), test.nodeModule(/-loader$/)),
        loaders: [
          'ng-annotate-loader?sourceMap',
          // fix ng-annotate source maps in Windows but using absolute paths in incoming source-map
          'adjust-sourcemap-loader?format=absolute',
          'nginject-loader?sourceMap&deprecate&singleQuote',
          // https://github.com/feross/buffer/issues/79
          // http://stackoverflow.com/a/29857361/5535360
          'babel-loader?sourceMap&ignore=buffer&compact=false&cacheDirectory=.babel'
        ]
      });
  }

  function checkExists(file) {
    return fs.existsSync(path.resolve(file));
  }
}

module.exports = legacy;