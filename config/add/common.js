'use strict';

var path = require('path');

var webpack               = require('webpack'),
    adjustSourcemapLoader = require('adjust-sourcemap-loader'),
    ExtractTextPlugin     = require('extract-text-webpack-plugin'),
    BowerWebpackPlugin    = require('bower-webpack-plugin'),
    EntryGeneratorPlugin  = require('entry-generator-webpack-plugin'),
    OmitTildePlugin       = require('omit-tilde-webpack-plugin');

/**
 * Add configuration common to all modes.
 * @this {Config} A webpack-configurator instance
 * @param {string} loaderRoot The base path in which to locate loaders
 * @param {{appDir:string, globals:object, stats:string}} options A hash of options
 * @returns {Config} The given webpack-configurator instance
 */
function common(loaderRoot, options) {
  var vendorEntry = path.resolve(options.appDir, 'vendor.js'),
      templateFn  = adjustSourcemapLoader.moduleFilenameTemplate({
        format: 'projectRelative'
      });

  // Note that DedupePlugin causes problems when npm linked so we will ommit it from the common configuration
  // you need to add it yourself if you wish to use it
  //  https://github.com/webpack/karma-webpack/issues/41#issuecomment-139516692

  /* jshint validthis:true */
  return this
    .merge({
      context      : process.cwd(),
      cache        : true,
      devtool      : 'source-map',
      entry        : {
        vendor: vendorEntry
      },
      output       : {
        filename                             : '[name].[chunkhash].js',
        chunkFilename                        : '[name].[chunkhash].js',
        devtoolModuleFilenameTemplate        : templateFn,
        devtoolFallbackModuleFilenameTemplate: templateFn
      },
      resolve      : {
        // do not use root as we want node_modules in linked projects to take precedence
        modulesDirectories: ['node_modules', 'bower_components'],
        fallback          : [path.resolve('node_modules'), path.resolve('bower_components')]
      },
      resolveLoader: {
        // do not use root as we want node_modules in linked projects to take precedence
        modulesDirectories: ['node_modules'],
        fallback          : [loaderRoot, path.resolve('node_modules')]
      },
      node         : {
        fs: 'empty'
      },
      stats        : options.stats
    })

    // before compile
    .preLoader('linting', {
      test   : /\.js$/i,
      exclude: /[\\\/](node_modules|bower_components)[\\\/]/i,
      loader : 'jshint'
    })

    // some obscure modules like to 'require()' angular, but bower angular does not export anything
    .loader('export-angular', {
      test   : /[\\\/]angular\.js$/i,
      include: /[\\\/]bower_components[\\\/]/i,
      loader : 'exports?angular'
    })

    // supported file types
    .loader('css', {
      test  : /\.css$/i,
      loader: ExtractTextPlugin.extract('css?minimize&sourceMap!resolve-url?sourceMap')
    })
    .loader('sass', {
      test  : /\.scss$/i,
      loader: ExtractTextPlugin.extract('css?minimize&sourceMap!resolve-url?sourceMap!sass?sourceMap')
    })
    .loader('image', {
      test   : /\.(jpe?g|png|gif|svg)([#?].*)?$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack?optimizationLevel=7&interlaced=false'
      ]
    })
    .loader('woff', {
      test  : /\.woff2?([#?].*)?$/i,
      loader: 'url?limit=10000&mimetype=application/font-woff&name=[hash].[ext]'
    })
    .loader('font', {
      test  : /\.(eot|ttf|ico|otf)([#?].*)?$/i,
      loader: 'file?name=[hash].[ext]'
    })
    .loader('js-bower', {
      test   : /\.js$/i,
      include: /[\\\/]bower_components[\\\/]/i,
      loaders: [
        'adjust-sourcemap?format=outputRelative',
        'ng-annotate?sourceMap'
      ]
    })
    .loader('js', {
      test   : /\.js$/i,
      exclude: /[\\\/](bower_components|webpack|css-loader)[\\\/]/i,
      loaders: [
        'ng-annotate?sourceMap',
        'adjust-sourcemap?format=absolute',  // fix ng-annotate source maps in Windows but tweaking incoming map
        'nginject?sourceMap&deprecate&singleQuote',
        'babel?sourceMap&ignore=buffer&compact=false'
        // https://github.com/feross/buffer/issues/79
        // http://stackoverflow.com/a/29857361/5535360
      ]
    })
    .loader('html', {
      test  : /\.html?$/i,
      loader: 'html?removeComments=false&attrs=img:src link:href'
    })
    .loader('json', {
      test  : /\.json$/i,
      loader: 'json'
    })

    // bower
    .plugin('generate-vendor', EntryGeneratorPlugin, [
      vendorEntry,
      EntryGeneratorPlugin.bowerDependenciesSource()
    ])
    .plugin('omit-tilde', OmitTildePlugin, [{
      include  : ['package.json', 'bower.json'],
      deprecate: true
    }])
    .plugin('bower', BowerWebpackPlugin, [{
      includes                       : /\.((js|css)|(woff2?|eot|ttf|otf)([#?].*)?)$/i,
      searchResolveModulesDirectories: false
    }])

    // globals
    .plugin('provide', webpack.ProvidePlugin, [options.globals])

    // output, chunking, optimisation
    .plugin('extract-text', ExtractTextPlugin, [
      undefined,
      '[name].[contenthash].css',
      {allChunks: true}
    ])
    .plugin('commons', webpack.optimize.CommonsChunkPlugin, [{
      name     : 'vendor',
      minChunks: Infinity
    }])
    .plugin('occurence-order', webpack.optimize.OccurenceOrderPlugin);
}

module.exports = common;