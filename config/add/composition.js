'use strict';

var path = require('path');

var IndexHTMLPlugin  = require('indexhtml-webpack-plugin'),
    GulpInjectPlugin = require('gulp-inject-webpack-plugin');

/**
 * Add an application for compilation.
 * @this {Config} A webpack-configurator instance
 * @param {{namespace:Array.<string>, directory:string, htmlFiles:Array, indexFiles:Array}} item A composition item
 * @returns {Config} The given webpack-configurator instance
 */
function composition(item) {
  /* jshint validthis:true */
  return this
    .merge({
      name : ['app'].concat(composition.namespace).join(':'),
      entry: {
        'index-html': item.htmlFiles,
        index       : item.indexFiles
      }
    })
    .plugin('index-html', IndexHTMLPlugin, [
      'index-html',
      'index.html'
    ])
    .plugin('gulp-inject', GulpInjectPlugin, [
      'index-html',
      ['manifest.json', 'vendor', /^vendor\./, 'index'],
      {relative: true}
    ]);
}

module.exports = composition;