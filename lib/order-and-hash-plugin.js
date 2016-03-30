'use strict';

var md5 = require('md5');

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