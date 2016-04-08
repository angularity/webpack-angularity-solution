'use strict';

/**
 * Create a filter for apps given a comma separated list.
 * @param {Array.<string>|string|boolean} names A list of names to include, or true for all and false for none
 * @returns {function} A composition filter function
 */
function appFilter(names) {
  var strNames = String(names),
      list     = Array.isArray(names) ? names.map(trim) : (strNames === 'true') ? ['*'] : (strNames === 'false') ? [] :
        strNames.split(',').map(trim);

  return function filter(composition) {
    var actual = [].concat(composition.namespace).join('.');
    return list.some(testName);

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