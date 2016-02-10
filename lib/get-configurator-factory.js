'use strict';

var Config = require('webpack-configurator');

/**
 * Create a factory for webpack-configurator with additional methods as given.
 * @param {object} operators A hash of methods to add to webpack-configurator
 * @returns {Config} A webpack-configurator instance with the additional operators
 */
function getConfiguratorFactory(operators) {
  return function configuratorFactory() {
    var instance = new Config();
    for (var key in operators) {
      if (typeof operators[key] === 'function') {
        instance[key] = operators[key].bind(instance);
      } else {
        throw new Error('The operator named "' + key + '" must be function.')
      }
    }
    return instance;
  }
}

module.exports = getConfiguratorFactory;