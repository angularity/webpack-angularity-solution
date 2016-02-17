'use strict';

var CleanPlugin = require('clean-webpack-plugin');

/**
 * Remove the given directory at compilation start.
 * @this {Config} A webpack-configurator instance
 * @param {string} directory A directory to remove at start of compilation
 * @returns {Config} The given webpack-configurator instance
 */
function clean(directory) {
  /* jshint validthis:true */
  return this
    .plugin('clean', CleanPlugin, [
      directory,
      {root: process.cwd(), verbose: false}
    ]);
}

module.exports = clean;