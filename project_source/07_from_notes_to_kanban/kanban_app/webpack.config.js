var path = require('path');
var webpack = require('webpack');
var merge = require('./lib/merge');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

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

if(TARGET === 'build') {
  module.exports = mergeConfig({
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel?stage=0',
          include: path.join(ROOT_PATH, 'app'),
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // This has effect on the react lib size
          'NODE_ENV': JSON.stringify('production'),
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
      }),
    ],
  });
}

if(TARGET === 'dev') {
  module.exports = mergeConfig({
    entry: ['webpack/hot/dev-server'],
    module: {
      preLoaders: [
        {
          test: /\.jsx?$/,
          loader: 'eslint-loader',
          include: path.join(ROOT_PATH, 'app'),
        }
      ],
      loaders: [
        {
          test: /\.jsx?$/,
          // XXXXX: flowcheck doesn't support annotations yet so we need to hack
          // around a bit
          loaders: ['react-hot', 'babel', 'flowcheck', 'babel?stage=0&blacklist=flow'],
          include: path.join(ROOT_PATH, 'app'),
        }
      ]
    },
    plugins: [
      // do not reload if there is a syntax error in your code
      new webpack.NoErrorsPlugin()
    ],
  });
}
