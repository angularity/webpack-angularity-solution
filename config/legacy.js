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
        OmitTildePlugin = require('omit-tilde-webpack-plugin');

    /* jshint validthis:true */
    return configurator
      .plugin('omit-tilde', OmitTildePlugin, [{
        test     : /\.s?css$/,
        include  : ['package.json', 'bower.json'].filter(checkExists),
        deprecate: true
      }])
      .removeLoader('js')
      .loader('js', {
        test   : /\.js$/i,
        exclude: /[\\\/](bower_components|webpack|css-loader)[\\\/]/i,
        loaders: [
          'ng-annotate?sourceMap',
          // fix ng-annotate source maps in Windows but using absolute paths in incoming source-map
          'adjust-sourcemap?format=absolute',
          'nginject?sourceMap&deprecate&singleQuote',
          // https://github.com/feross/buffer/issues/79
          // http://stackoverflow.com/a/29857361/5535360
          'babel?sourceMap&ignore=buffer&compact=false&cacheDirectory=.babel'
        ]
      });
  }

  function checkExists(file) {
    return fs.existsSync(path.resolve(file));
  }
}

module.exports = legacy;