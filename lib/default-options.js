'use strict';

function defaultOptions() {
  return {
    appDir    : './app',
    buildDir  : './app-build',
    testDir   : './app-test',
    releaseDir: './app-release',
    testGlob  : '**/*.spec.js',
    port      : 55555,
    unminified: false,
    publicPath: undefined,
    globals   : {},
    stats     : {
      hash        : true,
      version     : true,
      timings     : true,
      assets      : true,
      chunks      : true,
      modules     : true,
      reasons     : true,
      children    : true,
      source      : true,
      errors      : true,
      errorDetails: true,
      warnings    : true,
      publicPath  : true
    }
  };
}

module.exports = defaultOptions;