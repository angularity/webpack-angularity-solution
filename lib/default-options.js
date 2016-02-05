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
    globals   : {}
  };
}

module.exports = defaultOptions;