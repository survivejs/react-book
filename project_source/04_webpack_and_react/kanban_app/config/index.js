var path = require('path');
var _ = require('lodash');

var ROOT_PATH = path.resolve(__dirname, '..');

var common = {
  entry: [path.join(ROOT_PATH, 'app/main.js')],
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
      },
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  },
};

var mergeConfig = merge.bind(null, common);

exports.build = mergeConfig({});

exports.develop = mergeConfig({
  entry: ['webpack/hot/dev-server']
});

function merge(a, b) {
  return _.merge(b, a, joinArrays);

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
