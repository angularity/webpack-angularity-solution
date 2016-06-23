'use strict';

/**
 * Create a factory function that yields a webpack-configurator with additional methods as given.
 * @param {object} operators A hash of methods to add to webpack-configurator
 * @returns {function():Config} A webpack-configurator factory method
 */
function configuratorFactory(operators) {
  return factory;

  /**
   * Invoke the base factory and add the given operators to the instance it creates.
   * @param {function():Config} baseFactory A factory provided by webpack-multi-configurator
   * @returns {Config} A webpack-configurator instance
   */
  function factory(baseFactory) {
    var instance = baseFactory();
    for (var key in operators) {
      if (operators.hasOwnProperty(key)) {
        if (typeof operators[key] === 'function') {
          instance[key] = operators[key].bind(instance);
        } else {
          throw new Error('The operator named "' + key + '" must be function.');
        }
      }
    }
    return instance;
  }
}

module.exports = configuratorFactory;