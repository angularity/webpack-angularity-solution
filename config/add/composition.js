'use strict';

/**
 * Add an application for compilation.
 * @this {Config} A webpack-configurator instance
 * @param {{namespace:Array.<string>, directory:string, htmlFile:string, indexFiles:Array}} item A composition item
 * @param {string} [useHash] Optionally determine whether the output file is hashed
 * @returns {Config} The given webpack-configurator instance
 */
function composition(item, useHash) {

  // lazy import packages
  var path                = require('path'),
      HtmlWebpackPlugin   = require('html-webpack-plugin'),
      ExtractTextPlugin   = require('extract-text-webpack-plugin'),
      htmlTemplateContent = require('../../lib/html-template-content');

  /* jshint validthis:true */
  return this
    .merge({
      name : ['app'].concat(item.namespace).join(':'),
      entry: {
        indexhtml: item.htmlFile,
        index    : item.indexFiles
      }
    })

    // extract the text of the index.html
    //  don't minimize or interpolate as embedded script (e.g. google analytics) can crash the html parser
    //  loaders in the common configuration must not overlap
    .loader('index-html', {
      test  : path.resolve(item.htmlFile),
      loader: ExtractTextPlugin.extract('html?minimize=false&attrs=img:src link:href', {
        id: 'html'
      })
    })
    .plugin('extract-text-html', ExtractTextPlugin, [
      'html',
      'indexhtml.html'
    ])

    // there are few options for index.html that are compatible with long term caching
    //  https://github.com/webpack/webpack/issues/1315#issuecomment-171896778
    .plugin('index-html', HtmlWebpackPlugin, [{
      filename       : 'index.html',
      excludeChunks  : ['manifest', 'indexhtml'],
      templateContent: htmlTemplateContent('indexhtml', useHash),
      minify         : false,
      inject         : false
    }]);
}

module.exports = composition;