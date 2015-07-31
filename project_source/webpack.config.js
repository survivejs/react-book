var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var Clean = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var pkg = require('./package.json');

var ROOT_PATH = path.resolve(__dirname);

module.exports = function() {
  return {
    entry: {
      app: path.resolve(ROOT_PATH, 'app/main'),
      vendor: Object.keys(pkg.dependencies)
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    output: {
      path: path.resolve(ROOT_PATH, 'build'),
      filename: 'app.[chunkhash].js'
    },
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: path.resolve(ROOT_PATH, 'app')
        },
        {
          test: /\.jsx?$/,
          loaders: ['babel?stage=1'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    },
    plugins: [
      new HtmlwebpackPlugin({
        title: 'Kanban app'
      }),
      new ExtractTextPlugin('styles.css'),
      new Clean(['build']),
      new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        'vendor.[chunkhash].js'
      ),
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
