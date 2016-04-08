'use strict';

/**
 * Inject css and script tags into HTML where marked by gulp-inject like annotations.
 * @param {string} content Html content with gulp-inject like annotations
 * @param {{css:Array.<string>, js:Array.<string>, inline:Array.<string>}} files A hash of files to inject
 * @returns {string|undefined} Html with injections on success or undefined on failure
 */
function htmlInject(content, files) {
  var mode;

  return (content || '')
    .split(/<!--\s*(inject:\w+|endinject)\s*-->/)
    .reduce(reduceElements, '');

  function reduceElements(reduced, element, i) {
    switch (i % 4) {
      case 0:
        return reduced + element;
      case 1:
        var analysis = /^inject\:(\w+)$/.exec(element);
        if (!mode && analysis) {
          mode = analysis[1];
          return reduced + element;
        }
        break;
      case 2:
        switch (mode) {
          case 'css':
            return reduced + files.css.map(eachCss).join('');
          case 'js':
            return reduced + files.inline.map(eachInline).join('') + files.js.map(eachJs).join('');
          default:
            return reduced;
        }
        break;
      case 3:
        if (element === 'endinject') {
          mode = null;
          return reduced;
        }
    }
  }

  function eachCss(file) {
    return '<link rel="stylesheet" href="' + file + '">';
  }

  function eachInline(script) {
    return '<script>' + script + '</script>';
  }

  function eachJs(file) {
    return '<script type="text/javascript" src="' + file + '"></script>';
  }
}

module.exports = htmlInject;