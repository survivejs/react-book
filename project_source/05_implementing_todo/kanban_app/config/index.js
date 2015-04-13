'use strict';
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');

var ROOT_PATH = path.resolve(__dirname, '..');

var common = {
  entry: [path.join(ROOT_PATH, 'app/main.jsx')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      }
    ]
  },
};

var mergeConfig = merge.bind(null, common);

exports.build = mergeConfig({
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  }
});

exports.develop = mergeConfig({
  entry: ['webpack/hot/dev-server'],
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        include: path.join(ROOT_PATH, 'app'),
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel', 'flowcheck'],
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  },
  plugins: [
    // do not reload if there is a syntax error in your code
    new webpack.NoErrorsPlugin()
  ],
});

function merge(source, target) {
  return _.merge(target, source, joinArrays);

  // concat possible arrays
  function joinArrays(a, b) {
    if(_.isArray(a) && _.isArray(b)) {
      return a.concat(b);
    }
    if(_.isPlainObject(a) && _.isPlainObject(b)) {
      return _.merge(a, b, joinArrays);
    }

    return a;
  }
}
