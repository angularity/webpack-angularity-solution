'use strict';

var path = require('path');

var glob = require('glob');

/**
 * Detect all compositions in the given base directory.
 * @param {string} appDir The directory to search for composition roots
 * @returns {Array.<object>} A list of composition items
 */
function compositions(appDir) {
  var files = glob.sync(appDir + '/**/index.html') || [];
  return files
    .map(fileToItem)
    .sort(sortByDirectory);

  function fileToItem(file) {
    var posix     = path.dirname(file).replace(/[\\\/]/g, '/'),
        relative  = path.relative(path.resolve(appDir), path.resolve(file)),
        directory = path.dirname(relative)
          .replace(/^\.$/, ''),
        namespace = directory
          .split(/[\\\/]/)
          .filter(Boolean);

    return {
      directory : directory,
      namespace : namespace,
      htmlFiles : file,
      indexFiles: glob.sync(posix + '/index.{js,css,scss}')
    };
  }

  function sortByDirectory(a, b) {
    return (a.directory > b.directory);
  }
}

module.exports = compositions;