'use strict';

var Config = require('webpack-configurator');

/**
 * Create a webpack-configurator with additional methods as given
 * @param {object} operators A hash of methods
 * @returns {Config} A webpack-configurator instance with the additional operators
 */
function createConfigurator(operators) {
  var instance = new Config();
  for (var key in operators) {
    instance[key] = operators[key].bind(instance);
  }
  return instance;
}

module.exports = createConfigurator;