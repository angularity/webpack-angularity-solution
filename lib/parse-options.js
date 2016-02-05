var snakeCase = require('snake-case');

function parseOptions(options, defaults) {
  return Object.keys(defaults)
    .reduce(eachKey, {});

  function eachKey(reduced, key) {
    var altKey = snakeCase(key).toUpperCase(),  // someKey => SOME_KEY
        type   = typeof defaults[key],
        value  = (key in options) ? options[key] : (altKey in options) ? options[altKey] : defaults[key];
    reduced[key] = cast(value, type);
    return reduced;
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