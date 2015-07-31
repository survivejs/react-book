var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var Clean = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(o) {
  if(!o.inputPath) {
    console.warn('missing input path');
  }

  if(!o.outputPath) {
    console.warn('missing output path');
  }

  //var pkg = require(path.resolve(o.inputPath, 'package.json'));
  //var deps = pkg.dependencies || {};

  return {
    entry: {
      app: path.resolve(o.inputPath, 'app/main')
      //vendor: Object.keys(deps)
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
      root: o.inputPath
    },
    output: {
      path: o.outputPath,
      filename: 'app.[chunkhash].js'
    },
    //devtool: 'source-map', // big!!! skipping
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: path.resolve(o.inputPath, 'app')
        },
        {
          test: /\.jsx?$/,
          loaders: ['babel?stage=1'],
          include: path.resolve(o.inputPath, 'app')
        }
      ]
    },
    plugins: [
      new HtmlwebpackPlugin({
        title: 'Kanban app'
      }),
      new ExtractTextPlugin('styles.css'),
      new Clean(['.'], o.outputPath),
      // XXXXX: gives Uncaught Error: Cannot find module "alt"
      /*new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        'vendor.[chunkhash].js'
      ),*/
      new webpack.DefinePlugin({
        'process.env': {
          // This affects react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  };
};
