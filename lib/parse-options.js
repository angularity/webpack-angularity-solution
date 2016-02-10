'use strict';

var camelcase  = require('camelcase'),
    objectPath = require('object-path');

/**
 * Parse the given options where keys may be in camel-case or as environment variable.
 * Nested fields are supported by dot-delimited camel-case, or double-underscore delimited uppercase
 * IEEE Std 1003.1-2001.
 * @param {object} options A hash of options
 * @param {object} defaults A hash of the default values of all valid options
 * @returns {object} A complete set, preferring options and using defaults otherwise
 */
function parseOptions(options, defaults) {
  return Object.keys(options)
    .reduce(eachOptionKey, defaults);

  function eachOptionKey(reduced, key) {
    var expectedKey = key
      .split('__')
      .map(eachElement)
      .join('.');

    var isValid = objectPath.has(defaults, expectedKey);
    if (isValid) {
      var defaultValue = objectPath.get(defaults, expectedKey),
          newValue     = cast(options[key], typeof defaultValue);
      objectPath.set(reduced, expectedKey, newValue);
    }
    return reduced;

    function eachElement(text) {
      return camelcase(text);
    }
  }
}

module.exports = parseOptions;

function cast(value, type) {
  switch (type) {
    case 'string':
      return String(value);
    case 'number':
      return parseInt(value);
    case 'boolean':
      return /^\s*true\s*$/.test(value);
    default:
      return value;
  }
}