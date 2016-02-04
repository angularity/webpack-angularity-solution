'use strict';

var path = require('path'),
    fs   = require('fs');

var webpack              = require('webpack'),
    defaults             = require('lodash.defaults'),
    CleanPlugin          = require('clean-webpack-plugin'),
    ExtractTextPlugin    = require('extract-text-webpack-plugin'),
    ESManglePlugin       = require('esmangle-webpack-plugin'),
    BrowserSyncPlugin    = require('browser-sync-webpack-plugin'),
    BowerWebpackPlugin   = require('bower-webpack-plugin'),
    EntryGeneratorPlugin = require('entry-generator-webpack-plugin'),
    OmitTildePlugin      = require('omit-tilde-webpack-plugin'),
    ChunkManifestPlugin  = require('chunk-manifest-webpack-plugin');

var detectCompositions = require('./lib/detect-compositions');

/**
 * Create a webpack configuration
 * @param {object} [options] Optional options hash
 * @returns {object} Webpack configuration
 */
function configFactory(options) {

  // where angularity.json is present it should define the port
  var angularityJsonPath = path.resolve('angularity.json'),
      angularityPort     = fs.existsSync(angularityJsonPath) && require(angularityJsonPath).port;

  // options set
  options = defaults(options, {
    port    : angularityPort || 55555,
    noApp   : false,
    noTest  : false,
    noMinify: false,
    release : false,
    basePath: false,
    provide : {}
  });

  // additional entry points and plugins for each composition in the /app directory
  var compositions = detectCompositions('./app', !options.noApp);

  // determine the output directory
  var outputDirectory = options.release ? 'app-release' : 'app-build';

  // create configuration
  return {
    context      : process.cwd(),
    cache        : true,
    devtool      : 'source-map',
    entry        : defaults(compositions.entries, {
      vendor: './app/vendor.js',
      test  : !options.noTest && './app/test.js' || []
    }),
    output       : {
      path                                 : path.resolve(outputDirectory),
      publicPath                           : options.basePath,
      filename                             : '[name].[chunkhash].js',
      chunkFilename                        : '[name].[chunkhash].js',
      devtoolModuleFilenameTemplate        : '[resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[resource-path]'
    },
    resolve      : {
      alias   : {
        npm: path.resolve('node_modules')
      },
      root    : path.resolve('bower_components'),
      fallback: path.resolve('node_modules')
    },
    resolveLoader: {
      root    : path.join(__dirname, 'node_modules'),
      fallback: path.resolve('node_modules')
    },
    module       : {
      preloaders: [
        {
          test   : /\.js$/i,
          exclude: './node_modules',
          loader : 'jshint'
        }
      ],
      loaders   : [

        // some obscure modules like to 'require()' angular, but bower angular does not export anything
        {
          test   : /[\\\/]angular\.js$/i,
          include: /[\\\/]bower_components[\\\/]/i,
          loader : 'exports?angular'
        },

        // supported file types
        {
          test  : /\.css$/i,
          loader: ExtractTextPlugin.extract('sourcemap-sources?format=outputRelative!css?minimize&sourceMap!resolve-url?sourceMap')
        }, {
          test  : /\.scss$/i,
          loader: ExtractTextPlugin.extract('sourcemap-sources?format=outputRelative!css?minimize&sourceMap!resolve-url?sourceMap!sass?sourceMap')
        }, {
          test   : /\.(jpe?g|png|gif|svg)([#?].*)?$/i,
          loaders: [
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-webpack?optimizationLevel=7&interlaced=false'
          ]
        }, {
          test  : /\.woff2?([#?].*)?$/i,
          loader: 'url?limit=10000&mimetype=application/font-woff&name=[hash].[ext]'
        }, {
          test  : /\.(eot|ttf|ico)([#?].*)?$/i,
          loader: 'file?name=[hash].[ext]'
        }, {
          test   : /\.js$/i,
          include: /[\\\/]bower_components[\\\/]/i,
          loaders: [
            'sourcemap-sources?format=outputRelative',
            'ng-annotate?sourceMap'
          ]
        }, {
          test   : /\.js$/i,
          exclude: /[\\\/](bower_components|webpack|css-loader)[\\\/]/i,
          loaders: [
            'sourcemap-sources?format=projectRelative',
            'ng-annotate?sourceMap',
            'sourcemap-sources?format=absolute',  // fix ng-annotate source maps in Windows but tweaking incoming map
            'nginject?sourceMap&deprecate&singleQuote',
            'babel?sourceMap&ignore=buffer&compact=false'
            // https://github.com/feross/buffer/issues/79
            // http://stackoverflow.com/a/29857361/5535360
          ]
        }, {
          test  : /\.html?$/i,
          loader: 'html?removeComments=false&attrs=img:src link:href'
        }, {
          test  : /\.json$/i,
          loader: 'json'
        }
      ]
    },
    node         : {
      fs: 'empty'
    },
    plugins      : [
      // clean
      new CleanPlugin(outputDirectory, process.cwd()),

      // bower
      new OmitTildePlugin({
        include  : ['package.json', 'bower.json'],
        deprecate: true
      }),
      new BowerWebpackPlugin({
        includes                       : /\.((js|css)|(woff2?|eot|ttf)([#?].*)?)$/i,
        searchResolveModulesDirectories: false
      }),
      new EntryGeneratorPlugin('./app/vendor.js', [
        EntryGeneratorPlugin.bowerDependenciesSource()
      ]),

      // test suite
      !options.noTest && new EntryGeneratorPlugin('./app/test.js', [
        EntryGeneratorPlugin.bowerDevDependenciesSource(),
        EntryGeneratorPlugin.globSource('**/*.spec.js', {
          ignore: '**/{node_modules,bower_components,app*}/**'
        })
      ]),

      // dependencies
      new webpack.ProvidePlugin(options.provide),

      // output and chunking
      new ExtractTextPlugin(undefined, '[name].[contenthash].css', {
        allChunks: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name     : 'vendor',
        minChunks: Infinity
      }),
      !options.noMinify && new ESManglePlugin({exclude: /test.\w+.js$/i}), // don't minify unit tests
      (!options.noApp || options.release) && new ChunkManifestPlugin(),

      // optimise
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),

      // server
      new BrowserSyncPlugin({
        host  : 'localhost',
        port  : options.port,
        server: {
          baseDir: outputDirectory,
          routes : {'/': ''}
        },
        open  : false
      })
    ]
      .concat(compositions.plugins)
      .filter(Boolean)
  };
}

module.exports = configFactory;