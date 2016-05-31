const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function(o) {
  if(!o.inputPath) {
    console.warn('missing input path');
  }

  if(!o.outputPath) {
    console.warn('missing output path');
  }

  const appPath = path.resolve(o.inputPath, 'app');
  const stylePath = path.resolve(o.inputPath, 'app/main.css');

  //var pkg = require(path.resolve(o.inputPath, 'package.json'));
  //var deps = pkg.dependencies || {};

  return {
    entry: {
      app: appPath,
      style: stylePath
      //vendor: Object.keys(deps)
    },
    resolve: {
      root: o.inputPath,
      extensions: ['', '.js', '.jsx']
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
          include: appPath
        },
        {
          test: /\.jsx?$/,
          loaders: ['babel'],
          include: appPath
        }
      ]
    },
    plugins: [
      new HtmlwebpackPlugin({
        inject: false,
        template: require('html-webpack-template'),
        title: 'Kanban app',
        appMountId: 'app'
      }),
      new ExtractTextPlugin('styles.css'),
      new CleanWebpackPlugin(o.outputPath),
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
