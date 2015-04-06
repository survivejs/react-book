# Optimizing Development

We talked about how you could use the minified versions of your dependencies in development to make the rebundling go as fast as possible. Let us look at a small helper you can implement to make this a bit easier to handle.

*webpack.config.js*

```javascript
var webpack = require('webpack');
var path = require('path');
var node_modules_dir = path.join(__dirname, 'node_modules');

var deps = [
  'react/dist/react.min.js',
  'react-router/dist/react-router.min.js',
  'moment/min/moment.min.js',
  'underscore/underscore-min.js',
];

var config = {
  entry: ['webpack/hot/dev-server', './app/main.js'],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {}
  },
  module: {
    noParse: [],
    loaders: []
  }
};

// Run through deps and extract the first part of the path,
// as that is what you use to require the actual node modules
// in your code. Then use the complete path to point to the correct
// file and make sure webpack does not try to parse it
deps.forEach(function (dep) {
  var depPath = path.resolve(node_modules_dir, dep);
  config.resolve.alias[dep.split(path.sep)[0]] = depPath;
  config.module.noParse.push(depPath);
});

module.exports = config;
```

Not all modules include a minified distributed version of the lib, but most do. Especially with large libraries like React JS you will get a significant improvement.

## Exposing React.js to the global scope

You might be using distributed versions that requires React JS on the global scope. To fix that you can install the expose-loader by `npm install expose-loader --save-dev` and set up the following config, focusing on the *module* property:

```javascript
var webpack = require('webpack');
var path = require('path');
var node_modules_dir = path.join(__dirname, 'node_modules');

var deps = [
  'react/dist/react.min.js',
  'react-router/dist/react-router.min.js',
  'moment/min/moment.min.js',
  'underscore/underscore-min.js',
];

var config = {
  entry: ['webpack/hot/dev-server', './app/main.js'],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {}
  },
  module: {
    noParse: [],

    // Use the expose loader to expose the minified React JS
    // distribution. For example react-router requires this
    loaders: [{
      test: path.resolve(node_modules_dir, deps[0]),
      loader: "expose?React"
    }]
  }
};

deps.forEach(function (dep) {
  var depPath = path.resolve(node_modules_dir, dep);
  config.resolve.alias[dep.split(path.sep)[0]] = depPath;
  config.module.noParse.push(depPath);
});

module.exports = config;
```

## Optimizing Caching

When users hit the URL of your application they will need to download different assets. CSS, JavaScript, HTML, images and fonts. The great thing about Webpack is that you can stop thinking how you should download all these assets. You can do it through JavaScript.

> OccurenceOrderPlugin

### How can I attach hashes to my production output?

* Use `[hash]`. Example: `'assets/bundle.[hash].js'`

The benefit of this is that this will force the client to reload the file. There is more information about `[hash]` at [the long term caching](http://webpack.github.io/docs/long-term-caching.html) section of the official documentation.

> Is it possible to change the hash only if bundle changed?

## Lazy Loading Entry Points

TBD

## Creating a Common Bundle

TBD

## Understanding Chunks

- TBD: Explain how webpack thinks chunks and not files
- TBD: What are files to load? And what does webpack create for you? And how?

## Authoring Libraries

Webpack can be handy for packaging your library for general consumption. You can use it to output UMD, a format that's compatible with various module loaders (CommonJS, AMD) and globals.

## How can I output UMD for my library?

Especially if you are creating a library, it can be useful to output an UMD version of your library. This can be achieved using the following snippet:

```javascript
output: {
    path: './dist',
    filename: 'mylibrary.js',
    libraryTarget: 'umd',
    library: 'MyLibrary',
},
```

In order to avoid bundling big dependencies like React, you'll want to use a configuration like this in addition:

```javascript
externals: {
    react: 'react',
    'react/addons': 'react'
},
```

## How can I output a minified version of my library?

Here's the basic idea:

```javascript
output: {
    path: './dist',
    filename: 'awesomemular.min.js',
    libraryTarget: 'umd',
    library: 'Awesomemular',
},
plugins: [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
    }),
]
```
