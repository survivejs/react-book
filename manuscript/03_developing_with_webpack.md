# Developing with Webpack

In `Getting Started` we set up a minimal Webpack based build. Hitting `npm run build` all the time will get boring eventually. In addition refreshing browser manually is annoying. We can get rid of both of these problems if we do a bit more configuration work.

## Setting Up `webpack-dev-server`

As a first step, hit `npm i webpack-dev-server --save-dev` at project root. This will add Webpack development server we'll be relying upon.

In addition we'll need to tweak `package.json` *scripts* section to include it. Here's the basic idea:

**package.json**

```json
{
  "scripts": {
    "build": "webpack",
    "start": "webpack-dev-server --config webpack.development.js --devtool eval --progress --colors --hot --content-base build"
  }
}
```

**webpack.development.js**

```javascript
var path = require('path');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
};
```

**build/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <div id="app"></div>

    <script src="http://localhost:8080/webpack-dev-server.js"></script>
    <script src="bundle.js"></script>
  </body>
</html>
```

When you run `npm start` from your terminal it will execute the command mapping to `start` script of the `scripts` section. This is what it does:

1. `webpack-dev-server` - Starts a web service on `localhost:8080`
2. `--config webpack.development.js` - Points at custom development configuration we'll set up later
3. `--devtool eval` - Creates source urls for your code. Making you able to pinpoint by filename and line number where any errors are thrown
4. `--progress` - Will show progress of bundling your application
5. `--colors` - Colors in the terminal!
6. '--hot' - Enable hot module loading
7. `--content-base build` - Points to the output directory configured

To recap, when you run `npm start` this will fire up the webservice, watch for file changes and automatically rebundle your application when any file changes occur.

Go to **http://localhost:8080** and you should see something. If you want to use some other port than 8080, you can pass `--port` parameter (ie. `--port 4000`) to *webpack-dev-server*.

T> Note that scripts such as `start` or `test` are special cases. You can run them directly through `npm`. Normally you run these scripts through `npm run` (ie `npm run start` or `npm run build`).

T> Alternatively we can run the application from **http://localhost:8080/webpack-dev-server/bundle** instead of root. It provides an iframe showing a status bar that indicates the status of the rebundling process. You can alternatively examine your browser log for the same information and possible errors.

## Automatic Browser Refresh

When **webpack-dev-server** is running it will watch your files for changes. When that happens it rebundles your project and notifies browsers listening to refresh. If you try modifying **app/component.js** you should see the changes propagate to your browser now.

We can easily extend the approach to work with CSS. Webpack allows us to modify CSS without forcing a full refresh. Let's see how to achieve that next.

## Loading CSS

In order to load CSS to project, we'll need to use a couple of loaders. To get started, invoke `npm i css-loader style-loader --save-dev`. Now that we have the loaders we need, we'll need to make sure Webpack is aware of them. It's time to configure.

**webpack.development.js**

```javascript
var path = require('path');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  }
};
```

The configuration we added tells Webpack that whenever it meets some file ending with `css` it should invoke the power of loaders in this specific order. This is done by matching against `test` regular expression.

Loaders are evaluated from right to left. In this case it will pass a possible CSS file to *css-loader* first and to *style-loader* after that. *css-loader* will resolve `@import` and `url` statements of our CSS files. *style-loader* deals with `require` statements in our JavaScript. Similar approach works with CSS preprocessors.

W> Although `['style', 'css']` type loader configuration can be convenient, it can lead to issues due to the way the lookup works. If you happened to have `css` named module installed at `node_modules`, it would try to use that instead of `css-loader` which we might expect!

We are missing just one bit, the actual CSS itself:

**app/stylesheets/main.css**

```css
body {
  background: cornsilk;
}
```

In addition we'll need to make Webpack aware of this file:

**app/main.js**

```
require('./stylesheets/main.css');

...
```

Hit `npm start` now and point your browser to *localhost:8080* provided you are using the default port.

To see the magic in action, you should open up *main.css* and change the background color to something nice like `lime` (`background: lime`). Develop styles as needed. Experiment.

In order to make our normal build (`npm run build`) work with CSS, you could attach that *module* bit to `webpack.config.js` too. Given it can be cumbersome to maintain configuration like this, I'll show you a nicer way.

## Sharing Common Configuration

If we don't structure our configuration in a smart way, it will become easy to make mistakes. We'll want to avoid unnecessary duplication. Given Webpack configuration is just JavaScript, there are many ways to approach the problem. As long as we generate the structure Webpack expects, we should be fine.

One way to do this is to keep all configuration in `webpack.config.js` and control what it returns using an environment variable. The advantage of this approach is that you can see all the bits and pieces and how they relate to each other from single place.

We can adapt this approach to our project quite easily. First of all let's set up a structure like this:

- webpack.config.js - Our configuration
- /lib
  - merge.js - This will merge configuration to avoid duplication

**webpack.config.js**

```javascript
var path = require('path');
var merge = require('./lib/merge');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: [path.join(ROOT_PATH, 'app/main.js')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  },
};

var mergeConfig = merge.bind(null, common);

if(TARGET === 'build') {
  module.exports = mergeConfig({});
}

if(TARGET === 'dev') {
  module.exports = mergeConfig({
    entry: ['webpack/hot/dev-server']
  });
}
```

**lib/merge.js**

```javascript
var _ = require('lodash');

module.exports = function(source, target) {
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
};
```

Remember to invoke `npm i lodash --save-dev` so our merge function will work!

The common configuration has been separated to a section of its own. In this case `build` configuration is actually the same as `common` configuration. We do a little tweak for `develop` case. As you can see the configuration is quite easy to follow this way.

To make everything work again, we'll need to tweak our `package.json` **scripts** section like this:

```json
{
  "scripts": {
    "build": "TARGET=build webpack",
    "start": "TARGET=dev webpack-dev-server --devtool eval --progress --colors --hot --content-base build"
  }
}
```

W> `TARGET=build` type of declarations won't work on Windows! You should use `set TARGET=build&& webpack` kind of syntax there. It is important it's `build&&` and not `build &&` as that will fail. Later on Webpack will allow env to be passed to it directly making this cross-platform. For now this will work.

You can also eliminate those old configuration files at the project root while at it.

If everything went fine, the old commands should work still. Now we have something a little tidier together that's possible to grow even further with minimal work.

## html-webpack-plugin

In our current solution we've entangled our build and development version `index.html`. We definitely don't want reference to `http://localhost:8080/webpack-dev-server.js` to end up in our production version.

Fortunately we can resolve this problem by extending our system a little. We'll set up our own little server in which we'll wrap `WebpackDevServer` in addition we'll generate HTML of our production version dynamically with some hash so we get to benefit from client level caching.

TODO: discuss WebpackDevServer and html-webpack-plugin

It would be possible to generate this file with Webpack using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). You can give it a go if you are feeling adventurous. It is mostly a matter of configuration.

## Conclusion

In this chapter you learned how to go beyond a basic Webpack configuration. Webpack's development server is a powerful feature that has even more in store. We also learned how to organize our configuration more effectively. Next we'll delve deeper as we discuss hot to deal with linting in Webpack and why it's a powerful technique to adopt.
