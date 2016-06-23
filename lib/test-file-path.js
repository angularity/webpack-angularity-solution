'use strict';

var path = require('path');

/**
 * File path testing for use in webpack loader conditions.
 * @type {{any: any, all: all, directory: directory, nodeModule: nodeModule}}
 */
module.exports = {
  any       : any,
  all       : all,
  directory : directory,
  nodeModule: nodeModule
};

/**
 * Create a loader condition as any of the given loader condition functions.
 * @param {...function} elements Any number of condition functions
 * @returns {function} A webpack loader condition
 */
function any(elements) {
  elements = Array.prototype.slice.call(arguments);

  return function test(absolute) {
    return elements.some(invoke);

    function invoke(fn) {
      return fn(absolute);
    }
  };
}

/**
 * Create a loader condition as all of the given loader condition functions.
 * @param {...function} elements Any number of condition functions
 * @returns {function} A webpack loader condition
 */
function all(elements) {
  elements = Array.prototype.slice.call(arguments);

  return function test(absolute) {
    return elements.some(invoke);

    function invoke(fn) {
      return fn(absolute);
    }
  };
}

/**
 * Test whether the given name (or regular expression) is an immediate subdirectory of the working directory.
 * @param {string|RegExp} condition A directory name
 * @returns {function} A webpack loader condition
 */
function directory(condition) {
  return function test(absolute) {
    var relative = path.relative(process.cwd(), absolute),
        split    = relative.split(/[\\\/]/);
    return match(condition)(split[0]);
  };
}

/**
 * Test whether the given name (or regular expression) is an immediate subdirectory of any 'node_modules' directory
 * @param {string|RegExp} condition A directory name
 * @returns {function} A webpack loader condition
 */
function nodeModule(condition) {
  var matcher = match(condition);

  return function test(absolute) {
    var relative = path.relative(process.cwd(), absolute),
        split    = path.dirname(relative).split(/[\\\/]/);
    return split.some(matchName);

    function matchName(value, i, array) {
      return (i > 0) && (array[i - 1] === 'node_modules') && matcher(value);
    }
  };
}

/**
 * Create a matcher for the given string or regular expression.
 * For strings use the last portion of the path (i.e. deepest directory name).
 * @param {string|RegExp} condition The condition to test
 * @returns {Function} A matcher function
 */
function match(condition) {
  return function matcher(candidate) {

    // degenerate condition implies fail
    if (!condition || !candidate) {
      return false;
    }
    // regex condition implies RegExp.test()
    else if ((typeof condition === 'object') && (typeof condition.test === 'function')) {
      return condition.test(candidate);
    }
    // string implies direct match
    //  use the last portion of the path (i.e. deepest directory name) per path.basename()
    else {
      return (candidate === path.basename(condition));
    }
  };
}