'use strict';

var path = require('path'),
    fs   = require('fs');

var defaults = require('lodash.defaults');

var defaultOptions         = require('./lib/default-options'),
    parseOptions           = require('./lib/parse-options'),
    getConfiguratorFactory = require('./lib/get-configurator-factory');

var DEFAULT_OPERATORS = {
  addBrowserSync          : require('./config/add/browser-sync'),
  addClean                : require('./config/add/clean'),
  addCommon               : require('./config/add/common'),
  addComposition          : require('./config/add/composition'),
  addConditionals         : require('./config/add/conditionals'),
  addExternalChunkManifest: require('./config/add/external-chunk-manifest'),
  addMinification         : require('./config/add/minification'),
  addTestSuiteGeneration  : require('./config/add/test-suite-generation')
};

/**
 * Create a set of accessors that yield webpack configurator(s).
 * @param {...object} [options] Any number of options hashes to be merged
 * @returns {{app:function, test:function, release:function, resolve:function}} A new instance
 */
function create(options) {

  // legacy support
  //  where angularity.json is present it should define the port
  var angularityJsonPath = path.resolve('angularity.json'),
      angularityPort     = fs.existsSync(angularityJsonPath) && require(angularityJsonPath).port || undefined;

  // options set
  var args = Array.prototype.slice.call(arguments),
      opt  = parseOptions(
        defaults.apply(null, [{}].concat(args)),            // merged options in
        defaults({port: angularityPort}, defaultOptions())  // merged defaults
      );

  // default is the default operator set
  return extend(DEFAULT_OPERATORS);

  /**
   * Extend the configurator with the given operators.
   * @param {object} oldOperators A hash of the existing operators from the parent instance
   * @param {object} newOperators A hash of operator overrides
   * @returns {{extend:function, resolve:function, app:Array.<Configurator>, test:Configurator, release:Configurator}}
   */
  function extend(oldOperators, newOperators) {
    var operators           = defaults({}, newOperators, oldOperators),
        configuratorFactory = getConfiguratorFactory(operators);

    // create and return the instance
    var instance = {
      extend : extend.bind(null, operators),
      resolve: resolve,
      get app() {
        return require('./config/app')(configuratorFactory, opt);
      },
      get test() {
        return require('./config/test')(configuratorFactory, opt);
      },
      get release() {
        return require('./config/release')(configuratorFactory, opt);
      }
    };
    return instance;

    /**
     * Call the given function with the instance (as this) and resolve() any webpack configurators that it returns.
     * @param {function(instance:object):Config|Array.<Config>} fn A method to call with the instance as this
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
}

module.exports = create;