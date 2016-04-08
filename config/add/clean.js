'use strict';

/**
 * Remove the given directory at compilation start.
 * @this {Config} A webpack-configurator instance
 * @param {string} directory A directory to remove at start of compilation
 * @returns {Config} The given webpack-configurator instance
 */
function clean(directory) {

  // lazy import packages
  var CleanPlugin = require('clean-webpack-plugin');

  /* jshint validthis:true */
  return this
    .plugin('clean', CleanPlugin, [
      directory,
      {root: process.cwd(), verbose: false}
    ]);
}

module.exports = clean;