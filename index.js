'use strict';

var path = require('path'),
    fs   = require('fs');

var defaults = require('lodash.defaults');

var defaultOptions = require('./lib/default-options'),
    parseOptions   = require('./lib/parse-options');

/**
 * Create a set of methods that yield webpack configurator(s).
 * @param {...object} [options] Any number of options hashes to be merged
 * @returns {{app:function, test:function, release:function, resolve:function}} A new instance
 */
function configFactory(options) {

  // legacy support
  //  where angularity.json is present it should define the port
  var angularityJsonPath = path.resolve('angularity.json'),
      angularityPort     = fs.existsSync(angularityJsonPath) && require(angularityJsonPath).port;

  // options set
  var args = Array.prototype.slice.call(arguments),
      opt  = parseOptions(
        defaults.apply(null, [{}].concat(args)),            // merged options in
        defaults({port: angularityPort}, defaultOptions())  // merged defaults
      );

  // create and return the instance
  var instance = {
    app    : require('./config/app')(opt),
    test   : require('./config/test')(opt),
    release: require('./config/release')(opt),
    resolve: resolve
  };
  return instance;

  /**
   * Call the given function with the instance (as this) and resolve() any webpack configurators that it returns.
   * @param {function(instance:object}:Array.<Config>|Config} fn A method to call with the instance as this
   * @returns {Array.<object>|object} A webpack configuration or Array thereof
   */
  function resolve(fn) {
    if (typeof fn !== 'function') {
      throw new Error('The argument given to resolve() must be a function');
    }
    else {
      return [].concat(fn.call(instance))
        .filter(Boolean)
        .map(resolveElement);
    }

    function resolveElement(configurator) {
      return configurator.resolve();
    }
  }
}

module.exports = configFactory;