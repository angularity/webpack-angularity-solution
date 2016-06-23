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
      OrderAndHashPlugin    = require('../lib/order-and-hash-plugin'),
      test                  = require('../lib/test-file-path');

  // calculated values
  var vendorEntry = path.resolve(options.appDir, 'vendor.js'),
      loaderRoot  = path.resolve(__dirname, '..', 'node_modules');

  // final source-map sources should be project relative paths
  var templateFn = adjustSourcemapLoader.moduleFilenameTemplate({
    format: 'projectRelative'
  });

  // Note that DedupePlugin causes problems when npm linked so we will omit it from the common configuration
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
        // do not use resolve.root as we want node_modules in linked projects to take precedence
        modulesDirectories: ['node_modules', 'bower_components'],
        fallback          : [path.resolve('node_modules'), path.resolve('bower_components')],
        unsafeCache       : true
      },
      resolveLoader: {
        // do not use resolveLoader.root as we want node_modules in linked projects to take precedence
        modulesDirectories: ['node_modules'],
        fallback          : [loaderRoot, path.resolve('node_modules')],
        unsafeCache       : true
      },
      node         : {              // allow useful node packages to be consumed in your project
        fs: 'empty'
      },
      debug        : true,          // don't imply additional optimisations, we will add them explicitly
      defineDebug  : false,         // set compiler conditionals explicitly
      stats        : options.stats  // console output following build
    })

    // IMPORTANT:
    // * Must not load webpack loaders themselves (e.g. css-loader is commonly encountered)
    // * Below we must specify the name of each loader in full (e.g. use 'css-loader') do not use the short form
    //   (e.g. 'css') otherwise you will get false matches (e.g. 'jshint' package will be confused with 'jshint-loader')
    //   this is mainly a problem if you have sym-linked packages in your actual project

    // before compile
    .preLoader('linting', {
      test   : /\.js$/i,
      exclude: test.any(test.directory('node_modules'), test.directory('bower_components'), test.directory('..')),
      loader : 'jshint-loader'
    })

    // some obscure modules like to 'require()' angular, but bower angular does not export anything
    .loader('export-angular', {
      test   : /[\\\/]angular\.js$/i,
      include: /[\\\/]bower_components[\\\/]angular[\\\/]/i,
      loader : 'exports-loader?angular'
    })

    // supported file types
    .loader('css', {
      test  : /\.css$/i,
      loader: ExtractTextPlugin.extract(
        'css-loader?minimize&sourceMap!resolve-url-loader?sourceMap', {
          id: 'css'
        })
    })
    .loader('sass', {
      test  : /\.scss$/i,
      loader: ExtractTextPlugin.extract(
        'css-loader?minimize&sourceMap!resolve-url-loader?sourceMap!sass-loader?sourceMap', {
          id: 'css'
        })
    })
    .loader('image', {
      test   : /\.(jpe?g|png|gif|svg)([#?].*)?$/i,
      loaders: [
        'file-loader?name=[md5:hash:hex:20].[ext]',
        'image-webpack-loader?optimizationLevel=7&interlaced=false'
      ]
    })
    .loader('icon', {
      test   : /\.ico([#?].*)?$/i,
      loaders: [
        'file-loader?name=[md5:hash:hex:20].[ext]'
      ]
    })
    .loader('font', {
      test  : /\.(eot|ttf|otf)([#?].*)?$/i,
      loader: 'file-loader?name=[md5:hash:hex:20].[ext]'
    })
    .loader('woff', {   // NB: I coppied this from somewhere, not sure why we would embed woff and not other fonts
      test  : /\.woff2?([#?].*)?$/i,
      loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=[md5:hash:hex:20].[ext]'
    })
    .loader('js-bower', {
      test   : /\.js$/i,
      include: /[\\\/]bower_components[\\\/]/i,
      loader : 'ng-annotate-loader?sourceMap'
    })
    .loader('js', {
      test   : /\.js$/i,
      exclude: test.any(test.directory('bower_components'), test.nodeModule('webpack'), test.nodeModule(/-loader$/)),
      loaders: [
        // https://github.com/feross/buffer/issues/79
        // http://stackoverflow.com/a/29857361/5535360
        'babel-loader?sourceMap&ignore=buffer&compact=false&cacheDirectory=.babel',
        'ng-annotate-loader?sourceMap'
      ]
    })
    .loader('html', {
      test   : /\.html?$/i,
      exclude: test.directory(options.appDir),
      loader : 'html-loader?interpolate&removeComments=false&attrs=img:src link:href'
    })
    .loader('json', {
      test  : /\.json$/i,
      loader: 'json-loader'
    })

    // bower
    .plugin('generate-vendor', EntryGeneratorPlugin, [
      vendorEntry,
      EntryGeneratorPlugin.bowerDependenciesSource()
    ])
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

    // in order for long-term-caching to work the chunk hashes must not change when their content changes
    //  there is a sensitivity between file order and hashing so we just do both in one plugin of our own making
    .plugin('order-and-hash', OrderAndHashPlugin);
}

module.exports = common;