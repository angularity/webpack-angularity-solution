'use strict';

var assign = require('lodash.assign');

var htmlInject = require('./html-inject');

/**
 * Create a content template function for use with html-webpack-plugin.
 * @param {string} htmlEntry The name of the entry that should contain only the index.html
 * @param {boolean} [useHash] Optionally hash the output filename
 * @returns {function} content template function for use with html-webpack-plugin
 */
function templateContent(htmlEntry, useHash) {
  return function templateProper(context) {
    if (useHash) {
      context.compilation.plugin('html-webpack-plugin-after-html-processing', afterProcessing);
    }

    var assets       = context.compilation.assets,
        initialValue = {manifest: null};
    initialValue[htmlEntry] = null;

    // get the final content of the html entry and the chunk manifest (where present)
    var content = Object.keys(assets)
      .reduce(reduceAssets, initialValue);

    // inline the chunk manifest (where present)
    var files = assign({
      inline: content.manifest ? ['window["webpackManifest"]=' + content.manifest.toString()] : []
    }, context.htmlWebpackPlugin.files);

    // try to inject otherwise let the plugin do it
    var html = htmlInject(content.indexhtml, files);
    context.htmlWebpackPlugin.options.inject = !html;
    return html || content.indexhtml;

    function reduceAssets(reduced, key) {
      Object.keys(reduced).reduce(reduceCandidate, reduced);
      return reduced;

      function reduceCandidate(reduced, candidate) {
        if (key.indexOf(candidate + '.') === 0) {
          if (/\.(html|json)$/.test(key)) {
            reduced[candidate] =
              assets[key]._value ||
              assets[key].children[0]._value
                .split(/"/).slice(2, -2).join('')  // module.exports = "..."
                .replace(/\\"/g, '"');             // unescape quotations
          }
          delete assets[key];
        }
        return reduced;
      }
    }

    function afterProcessing(context, done) {
      var plugin  = context.plugin,
          options = plugin.options;
      options.filename = options.filename
        .replace('.', '.' + plugin.childCompilerHash.slice(0, 20) + '.');
      done();
    }
  };
}

module.exports = templateContent;