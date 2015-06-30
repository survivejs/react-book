var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: [path.join(ROOT_PATH, 'app/main')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      },
    ],
  },
};

if(TARGET === 'build') {
  module.exports = merge(common, {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Kanban app',
      }),
    ],
  });
}

if(TARGET === 'dev') {
  var IP = '0.0.0.0';
  var PORT = 8080;

  module.exports = merge(common, {
    ip: IP,
    port: PORT,
    entry: [
      'webpack-dev-server/client?http://' + IP + ':' + PORT,
      'webpack/hot/dev-server',
    ],
    output: {
      path: __dirname,
      filename: 'bundle.js',
      publicPath: '/',
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new HtmlWebpackPlugin(),
    ],
  });
}
