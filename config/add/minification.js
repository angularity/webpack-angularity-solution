'use strict';

var ESManglePlugin = require('esmangle-webpack-plugin');

/**
 * Minify javascript where enabled.
 * @this {Config} A webpack-configurator instance
 * @param {boolean} enabled Determines whether minification is enabled
 * @returns {Config} The given webpack-configurator instance
 */
function minification(enabled) {
  if (enabled) {
    this
      .plugin('minification', ESManglePlugin, [
        {exclude: /test.\w+.js$/i}
      ]);
  }
  return this;
}

module.exports = minification;