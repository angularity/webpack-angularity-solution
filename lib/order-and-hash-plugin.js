'use strict';

var md5 = require('md5');

/**
 * There is a sensitivity between chunk hashing and order within the chunk. This can mismatch when using separate
 * plugins for these functions.
 *
 * This plugin handles both in a way that leaves the chunk hash unchanged where its contents are unchanged. This is
 * critical for long-term caching.
 *
 * Its content is lifted from [path-order-webpack-plugin](https://www.npmjs.com/package/path-order-webpack-plugin) and
 * [webpack-md5-hash](https://www.npmjs.com/package/webpack-md5-hash), ensuring that the sort function is the same
 * between them/
 *
 * @constructor
 */
function OrderAndHashPlugin() {
}

module.exports = OrderAndHashPlugin;

OrderAndHashPlugin.prototype.apply = function apply(compiler) {
  compiler.plugin('compilation', onCompilation);

  function onCompilation(compilation) {
    compilation.plugin('optimize-module-order', optimiseModuleOrder);
    compilation.plugin('optimize-chunk-order', optimiseChunkOrder);
    compilation.plugin('chunk-hash', chunkHash);

    function optimiseModuleOrder(modules) {
      modules.sort(compare);
    }

    function optimiseChunkOrder(chunks) {
      chunks.sort(function (a, b) {
        return (a.name || '').localeCompare(b.name);
      });
    }

    function chunkHash(chunk, impl) {
      impl.digest = function () {
        return md5(chunk.modules.reduce(reduceModules, ''));
      };

      function reduceModules(reduced, module) {
        var source = module._source && module._source._value && module._source._value.replace(/\r\n/g, '\n') || '';
        return reduced + '[' + module.id + ']' + source;
      }
    }

    function compare(a, b) {
      return str(a).localeCompare(str(b));
    }

    function str(module) {
      if (!module) {
        return '';
      }
      else if (module.resource) {
        return relative(module.resource);
      }
      else if (module.identifierStr) {
        return relative(module.identifierStr);
      }
      else {
        return (module.dependencies || [])
          .map(value => value.module)
          .sort(compare)
          .join('&');
      }

      function relative(value) {
        return String(value || '').split(compiler.context).join('');
      }
    }
  }
};