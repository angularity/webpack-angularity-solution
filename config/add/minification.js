'use strict';

/**
 * Minify javascript where enabled.
 * @this {Config} A webpack-configurator instance
 * @param {boolean} enabled Determines whether minification is enabled
 * @returns {Config} The given webpack-configurator instance
 */
function minification(enabled) {

  // lazy import packages
  var ESManglePlugin = require('esmangle-webpack-plugin');

  /* jshint validthis:true */
  if (enabled) {
    this
      .plugin('minification', ESManglePlugin, [{
        exclude: /(test|indexhtml).\w+.js$/i  // breakage occurs if we don't exclude entry points for index.html, test
      }]);
  }
  return this;
}

module.exports = minification;