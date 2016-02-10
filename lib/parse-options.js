'use strict';

var camelcase  = require('camelcase'),
    objectPath = require('object-path');

function parseOptions(options, defaults) {
  return Object.keys(options)
    .reduce(eachOptionKey, defaults);

  function eachOptionKey(reduced, key) {
    var expectedKey = key
      .split('.')
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