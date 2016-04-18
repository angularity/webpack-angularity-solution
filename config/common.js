'use strict';

/**
 * Add configuration common to all modes.
 * @param {Config} configurator A webpack-configurator instance
 * @param {{appDir:string, globals:object, stats:string}} options A hash of options
 * @returns {Config} The given webpack-configurator instance
 */
function common(configurator, options) {

  // lazy import packages
  var path                  = require('path'),
      webpack               = require('webpack'),
      adjustSourcemapLoader = require('adjust-sourcemap-loader'),
      ExtractTextPlugin     = require('extract-text-webpack-plugin'),
      BowerWebpackPlugin    = require('bower-webpack-plugin'),
      EntryGeneratorPlugin  = require('entry-generator-webpack-plugin'),
      OmitTildePlugin       = require('omit-tilde-webpack-plugin'),
      OrderAndHashPlugin    = require('../lib/order-and-hash-plugin');

  // calculated values
  var vendorEntry = path.resolve(options.appDir, 'vendor.js'),
      loaderRoot  = path.resolve(__dirname, '..', 'node_modules'),
      templateFn  = adjustSourcemapLoader.moduleFilenameTemplate({
        format: 'projectRelative'
      });

  // make a regexp that excludes everything in the app directory
  //  this is important to ensure some loaders do not overlap
  var appRegExpSrc = path.resolve(options.appDir)
    .replace(/[\\\/]?$/g, '[\\\\\\/]')  // escape path separator
    .replace(/\./g, '\.');              // escape period
  var appRexExp = new RegExp(appRegExpSrc);

  // Note that DedupePlugin causes problems when npm linked so we will ommit it from the common configuration
  // you need to add it yourself if you wish to use it
  //  https://github.com/webpack/karma-webpack/issues/41#issuecomment-139516692
  return configurator
    .merge({
      context      : process.cwd(),
      cache        : true,
      devtool      : 'source-map',
      entry        : {
        vendor: vendorEntry
      },
      output       : {
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
      debug        : true,          // don't imply additional optimisations, we will add them explicitly
      defineDebug  : false,         // set compiler conditionals explicitly
      stats        : options.stats  // console output following build
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
      include: /[\\\/]bower_components[\\\/]angular[\\\/]/i,
      loader : 'exports?angular'
    })

    // supported file types
    .loader('css', {
      test  : /\.css$/i,
      loader: ExtractTextPlugin.extract('css?minimize&sourceMap!resolve-url?sourceMap', {
        id: 'css'
      })
    })
    .loader('sass', {
      test  : /\.scss$/i,
      loader: ExtractTextPlugin.extract('css?minimize&sourceMap!resolve-url?sourceMap!sass?sourceMap', {
        id: 'css'
      })
    })
    .loader('image', {
      test   : /\.(jpe?g|png|gif|svg)([#?].*)?$/i,
      loaders: [
        'file?name=[md5:hash:hex:20].[ext]',
        'image-webpack?optimizationLevel=7&interlaced=false'
      ]
    })
    .loader('icon', {
      test   : /\.ico([#?].*)?$/i,
      loaders: [
        'file?name=[md5:hash:hex:20].[ext]'
      ]
    })
    .loader('font', {
      test  : /\.(eot|ttf|otf)([#?].*)?$/i,
      loader: 'file?name=[md5:hash:hex:20].[ext]'
    })
    .loader('woff', {   // NB: I coppied this from somewhere, not sure why we would embed woff and not other fonts
      test  : /\.woff2?([#?].*)?$/i,
      loader: 'url?limit=10000&mimetype=application/font-woff&name=[md5:hash:hex:20].[ext]'
    })
    .loader('js-bower', {
      test   : /\.js$/i,
      include: /[\\\/]bower_components[\\\/]/i,
      loader: 'ng-annotate?sourceMap'
    })
    .loader('js', {
      test   : /\.js$/i,
      exclude: /[\\\/](bower_components|webpack|css-loader)[\\\/]/i,
      loaders: [
        'ng-annotate?sourceMap',
        // fix ng-annotate source maps in Windows but using absolute paths in incoming source-map
        'adjust-sourcemap?format=absolute',
        'nginject?sourceMap&deprecate&singleQuote',
        // https://github.com/feross/buffer/issues/79
        // http://stackoverflow.com/a/29857361/5535360
        'babel?sourceMap&ignore=buffer&compact=false'
      ]
    })
    .loader('html', {
      test   : /\.html?$/i,
      exclude: appRexExp,
      loader : 'html?interpolate&removeComments=false&attrs=img:src link:href'
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
      includes                       : /\.((js|css)|(jpe?g|png|gif|svg|ico)|(woff2?|eot|ttf|otf)([#?].*)?)$/i,
      searchResolveModulesDirectories: false
    }])

    // globals
    .plugin('provide', webpack.ProvidePlugin, [options.globals])

    // output, chunking, optimisation
    //  https://github.com/webpack/webpack/issues/1315#issuecomment-139930039
    .plugin('extract-text-css', ExtractTextPlugin, [
      'css',
      '[name].[md5:contenthash:hex:20].css',
      {allChunks: true}
    ])
    .plugin('commons', webpack.optimize.CommonsChunkPlugin, [{
      name     : 'vendor',
      minChunks: Infinity
    }])
    .plugin('order-and-hash', OrderAndHashPlugin);
}

module.exports = common;