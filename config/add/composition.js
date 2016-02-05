'use strict';

var path = require('path');

var IndexHTMLPlugin  = require('indexhtml-webpack-plugin'),
    GulpInjectPlugin = require('gulp-inject-webpack-plugin');

/**
 * Detect all compositions in the given base directory.
 * @this {Config} A webpack-configurator instance
 * @param {{directory:string, htmlFiles:Array, indexFiles:Array}} item A composition item
 * @returns {Config} The given webpack-configurator instance
 */
function composition(item) {
  /* jshint validthis:true */
  return this
    .merge({
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