'use strict';

/**
 * Add compiler conditionals.
 * @this {Config} A webpack-configurator instance
 * @param {object} flags A hash of flags to use approximate compiler conditionals
 * @returns {Config} The given webpack-configurator instance
 */
function conditionals(flags) {

  // lazy import packages
  var webpack = require('webpack');

  /* jshint validthis:true */
  return this
    .plugin('conditionals', webpack.ProvidePlugin, [flags]);
}

module.exports = conditionals;