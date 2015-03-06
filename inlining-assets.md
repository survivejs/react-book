# Inlining Assets

Until HTTP/2 is here you want to avoid setting up too many HTTP requests when your application is loading. Depending on the browser you have a set number of requests that can run in parallel.

## Inlining Images

If you load a lot of images in your CSS it is possible to automatically inline these images as BASE64 strings to lower the number of requests required. This can be based on the size of the image. There is a balance of size of download and number of downloads that you have to figure out for your project, and Webpack makes that balance easy to adjust.

## Installing the url-loader

`npm install url-loader --save-dev` will install the loader that can convert resolved paths as BASE64 strings. As mentioned in other sections of this cookbook Webpack will resolve "url()" statements in your CSS as any other require or import statements. This means that if we test on image file extensions for this loader we can run them through it.

```javascript
var path = require('path');

var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url?limit=25000'
    }]
  }
};
```

The limit is an argument passed to the url-loader. It tells it that images that er 25KB or smaller in size will be converted to a BASE64 string and included in the CSS file where it is defined.

## Inlining Fonts

Fonts can be really difficult to get right. First of all we have typically 4 different formats, but only one of them will be used by the respective browser. You do not want to inline all 4 formats, as that will just bloat your CSS file and in no way be an optimization.

### Choose one format

Depending on your project you might be able to get away with one font format. If you exclude Opera Mini, all browsers support the .woff and .svg format. The thing is that fonts can look a little bit different in the different formats, on the different browsers. So try out .woff and .svg and choose the one that looks the best in all browsers.

There are probably other strategies here too, so please share by creating an issue or pull request.

## Doing the actual inlining

You do this exactly like you do when inlining images.

```javascript
var path = require('path');

var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx'
    }, {
      test: /\.woff$/,
      loader: 'url?limit=100000'
    }]
  }
};
```

Just make sure you have a limit above the size of the fonts, or they will of course not be inlined.

> TBD: is there anything else that can/should be inlined?
