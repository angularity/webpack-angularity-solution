'use strict';

var ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');

/**
 * Minimise changes in asset hashing by externalising the chunk manifest.
 * Required for long term caching of assets.
 * @this {Config} A webpack-configurator instance
 * @returns {Config} The given webpack-configurator instance
 */
function externalChunkManifest() {
  /* jshint validthis:true */
  return this
    .plugin('chunk-manifest', ChunkManifestPlugin);
}

module.exports = externalChunkManifest;