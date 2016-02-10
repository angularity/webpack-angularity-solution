'use strict';

var path = require('path');

var glob              = require('glob'),
    BrowserSyncPlugin = require('browser-sync-webpack-plugin');

/**
 * Add browser-sync server for Webpack `--watch`.
 * @this {Config} A webpack-configurator instance
 * @param {string} directory Base directory for the server (should point to your compiled application)
 * @param {number} port Server port
 * @returns {Config} The given webpack-configurator instance
 */
function browserSync(directory, port) {
  /* jshint validthis:true */
  return this
    .plugin('browser-sync', BrowserSyncPlugin, [{
      host  : 'localhost',
      port  : port,
      server: {
        baseDir: directory,
        routes : {'/': ''}
      },
      open  : false
    }]);
}

module.exports = browserSync;