'use strict';

var path = require('path'),
    fs   = require('fs');

var webpack              = require('webpack'),
    globSync             = require('glob-sync').globSync,
    defaults             = require('lodash.defaults'),
    CleanPlugin          = require('clean-webpack-plugin'),
    ExtractTextPlugin    = require('extract-text-webpack-plugin'),
    ESManglePlugin       = require('esmangle-webpack-plugin'),
    BrowserSyncPlugin    = require('browser-sync-webpack-plugin'),
    BowerWebpackPlugin   = require('bower-webpack-plugin'),
    EntryGeneratorPlugin = require('entry-generator-webpack-plugin'),
    OmitTildePlugin      = require('omit-tilde-webpack-plugin'),
    ChunkManifestPlugin  = require('chunk-manifest-webpack-plugin'),
    IndexHTMLPlugin      = require('indexhtml-webpack-plugin'),
    GulpInjectPlugin     = require('gulp-inject-webpack-plugin');

/**
 * Create a webpack configuration
 * @param {{port:int, noApp:Boolean, noTest:Boolean, noMinify:boolean}} [options] Optional options hash
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
    noMinify: false
  });

  // create configuration
  return {
    context      : process.cwd(),
    cache        : true,
    devtool      : 'source-map',
    entry        : {
      vendor: './app/vendor.js',
      html  : !options.noApp && './app/index.html',
      index : !options.noApp && globSync('./app/index.{js,css,scss}'),
      test  : !options.noTest && './app/test.js'
    },
    output       : {
      path                                 : path.resolve('app-build'),
      filename                             : 'assets/[name].[chunkhash].js',
      chunkFilename                        : 'assets/[name].[chunkhash].js',
      devtoolModuleFilenameTemplate        : '[absolute-resource-path]',
      devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
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
          loader: ExtractTextPlugin.extract(
            '',
            'css?minimize&sourceMap!resolve-url?sourceMap'
          )
        }, {
          test  : /\.scss$/i,
          loader: ExtractTextPlugin.extract(
            '',
            'css?minimize&sourceMap!resolve-url?sourceMap!sass?sourceMap'
          )
        }, {
          test   : /\.(jpe?g|png|gif|svg)([#?].*)?$/i,
          loaders: [
            'file?hash=sha512&digest=hex&name=/assets/[hash].[ext]',
            'image-webpack?optimizationLevel=7&interlaced=false'
          ]
        }, {
          test  : /\.woff2?([#?].*)?$/i,
          loader: 'url?limit=10000&mimetype=application/font-woff&name=/assets/[hash].[ext]'
        }, {
          test  : /\.(eot|ttf|ico)([#?].*)?$/i,
          loader: 'file?name=/assets/[hash].[ext]'
        }, {
          test   : /\.js$/i,
          include: /[\\\/]bower_components[\\\/]/i,
          loader : 'ng-annotate?sourceMap'
        }, {
          test   : /\.js$/i,
          exclude: /[\\\/](bower_components|webpack-angularity-solution)[\\\/]/i,
          loaders: [
            'ng-annotate?sourceMap',
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
      new CleanPlugin(['app-build']),

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
      new webpack.ProvidePlugin({
        $              : 'jquery',
        jQuery         : 'jquery',
        'window.jQuery': 'jquery'
      }),

      // output and chunking
      new ExtractTextPlugin(undefined, 'assets/[name].[contenthash].css', {
        allChunks: true
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name     : 'vendor',
        minChunks: Infinity
      }),
      !options.noMinify && new ESManglePlugin({exclude: /test.\w+.js$/i}), // don't minify unit tests
      !options.noApp && new ChunkManifestPlugin(),
      !options.noApp && new IndexHTMLPlugin('html', 'index.html'),
      !options.noApp && new GulpInjectPlugin('html', ['manifest.json', 'vendor', /^vendor\./, 'index']),

      // optimise
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),

      // server
      new BrowserSyncPlugin({
        host  : 'localhost',
        port  : options.port,
        server: {
          baseDir: 'app-build',
          routes : {'/': ''}
        },
        open  : false
      })
    ].filter(Boolean)
  };
}

module.exports = configFactory;