'use strict';

var path = require('path');

var globSync         = require('glob-sync').globSync,
    IndexHTMLPlugin  = require('indexhtml-webpack-plugin'),
    GulpInjectPlugin = require('gulp-inject-webpack-plugin');

/**
 * Detect all compositions in the given base directory.
 * @param {string} baseDir A base directory in posix format, possibly relative to cwd
 * @param {boolean} [enable]
 */
function compositions(baseDir, enable) {
  var isEnabled = (arguments.length < 2) || !!enable,
      files     = isEnabled && globSync(baseDir + '/**/index.html') || [],
      items     = files.reduce(reduceFilesToItems, []);

  return {
    entries: items.reduce(reduceItemsToEntries, {}),
    plugins: items.reduce(reduceItemsToPlugins, [])
  };

  function reduceFilesToItems(array, file) {
    var posix     = path.dirname(file).replace(/[\\\/]/g, '/'),
        relative  = path.relative(path.resolve(baseDir), path.resolve(file)),
        directory = path.dirname(relative),
        namespace = directory.replace(/^\.$/, '').split(/[\\\/]/);

    return array.concat({
      directory : directory,
      htmlEntry : ['html'].concat(namespace).filter(Boolean).join('.'),
      htmlFiles : [file],
      indexEntry: ['index'].concat(namespace).filter(Boolean).join('.'),
      indexFiles: globSync(posix + '/index.{js,css,scss}')
    });
  }

  function reduceItemsToEntries(object, item) {
    object[item.htmlEntry] = item.htmlFiles;
    object[item.indexEntry] = item.indexFiles;
    return object;
  }

  function reduceItemsToPlugins(reduced, item) {
    return reduced.concat(
      new IndexHTMLPlugin(item.htmlEntry, path.join(item.directory, 'index.html')),
      new GulpInjectPlugin(item.htmlEntry, ['manifest.json', 'vendor', /^vendor\./, item.indexEntry], {
        relative: true
      })
    );
  }
}

module.exports = compositions;