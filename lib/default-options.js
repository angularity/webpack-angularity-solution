function defaultOptions() {
  return {
    appDir    : './app',
    buildDir  : './app-build',
    releaseDir: './app-release',
    testDir   : './app-test',
    testGlob  : '**/*.spec.js',
    port      : 55555,
    unminified: false,
    publicPath: undefined,
    globals   : {}
  };
}

module.exports = defaultOptions;