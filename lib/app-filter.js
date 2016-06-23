'use strict';

/**
 * Create a filter for apps given a comma separated list.
 *
 * Values may be <code>true</code> or <code>false</code> or a list of names or a pattern. The pattern is a
 * <code>string</code> with a trailing astrix.
 *
 * For example, if you have applications with namespace <code>app</code>, <code>app.foo</code>, and
 * <code>app.bar</code> then:
 * <ul>
 * <li><code>true</code> or <code>'true'</code> or <code>'app*'</code> will match all applications</li>
 * <li><code>'app'</code> will match only the base application</li>
 * <li><code>'app.*'</code> will match only the ancillary applications</li>
 * <li><code>false</code> or <code>false</code> will match no applications
 * </ul>
 *
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