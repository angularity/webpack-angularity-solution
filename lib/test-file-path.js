'use strict';

var path = require('path');

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

function match(stringOrRegexp) {
  return function (candidate) {
    return (typeof stringOrRegexp.test === 'function') ? stringOrRegexp.test(candidate) :
      (String(stringOrRegexp) === candidate);
  };
}