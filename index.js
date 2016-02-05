'use strict';

var path = require('path'),
    fs   = require('fs');

var defaults = require('lodash.defaults');

var defaultOptions = require('./lib/default-options'),
    parseOptions   = require('./lib/parse-options');

/**
 * Create a webpack configuration
 * @param {...object} [options] Any number of options hashes to be merged
 * @returns {object} Webpack configuration
 */
function configFactory(options) {

  // legacy support
  //  where angularity.json is present it should define the port
  var angularityJsonPath = path.resolve('angularity.json'),
      angularityPort     = fs.existsSync(angularityJsonPath) && require(angularityJsonPath).port;

  // options set
  var args = Array.prototype.slice.call(arguments),
      opt  = parseOptions(
        defaults.apply(null, [{}].concat(args)),              // merged options in
        defaults({port: angularityPort}, defaultOptions())    // merged defaults
      );

  // api
  return {
    get app() {
      return require('./config/app')(opt);
    },
    get test() {
      return require('./config/test')(opt);
    },
    get release() {
      return require('./config/release')(opt);
    }
  };
}

module.exports = configFactory;