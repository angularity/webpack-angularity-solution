'use strict';

/**
 * Create a filter for apps given a comma separated list.
 * @param {string} names A comma separated list of names to include
 * @returns {function} A composition filter function
 */
function appFilter(names) {
  var list = Array.isArray(names) ? names.map(trim) : String(names).split(',').map(trim);

  return function filter(composition) {
    var actual = composition.namespace.join('.'),
        result = list.some(testName);
    return result;

    function testName(name) {
      if (name.slice(-1) === '*') {
        var short = name.slice(0, -1);
        return (actual.slice(0, short.length) === short);
      }
      else {
        return (actual === name);
      }
    }
  };

  function trim(value) {
    return String(value).trim();
  }
}

module.exports = appFilter;