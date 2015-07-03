# Developing with Webpack

In `Getting Started` we set up a minimal Webpack based build. Hitting `npm run build` all the time will get boring eventually. In addition refreshing browser manually is annoying. We can get rid of both of these problems if we do a bit more configuration work.

## Setting Up `webpack-dev-server`

As a first step, hit `npm i webpack-dev-server --save-dev` at project root. This will add Webpack development server we'll be relying upon.

In addition we'll need to tweak `package.json` *scripts* section to include it. Here's the basic idea:

**package.json**

```json
...
"scripts": {
  "build": "webpack",
  "start": "webpack-dev-server --config webpack.development.js --devtool eval-source --progress --colors --hot --content-base build"
},
...
```

**webpack.development.js**

```javascript
var path = require('path');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    'webpack-dev-server/client?http://localhost:8080',
    path.resolve(ROOT_PATH, 'app/main.js'),
  ],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
};
```

When you run `npm start` from your terminal it will execute the command mapping to `start` script of the `scripts` section. This is what it does:

1. `webpack-dev-server` - Starts a web service on `localhost:8080`
2. `--config webpack.development.js` - Points at custom development configuration we'll set up later
3. `--devtool eval-source` - Creates source urls for your code. Making you able to pinpoint by filename and line number where any errors are thrown
4. `--progress` - Will show progress of bundling your application
5. `--colors` - Colors in the terminal!
6. `--hot` - Enable hot module loading
7. `--content-base build` - Points to the output directory configured

To recap, when you run `npm start` this will fire up the webservice, watch for file changes and automatically rebundle your application when any file changes occur.

Go to **http://localhost:8080** and you should see something. If you want to use some other port than 8080, you can pass `--port` parameter (ie. `--port 4000`) to *webpack-dev-server*.

Alternatively we can run the application from **http://localhost:8080/webpack-dev-server/bundle** instead of root. It provides an iframe showing a status bar that indicates the status of the rebundling process.

You can see this same information at your browser console log. It also injects `webpack-dev-server.js` automatically. So if you use the dev server through that specific url, you don't need that `script` line of ours at `index.html`.

T> Note that scripts such as `start` or `test` are special cases. You can run them directly through `npm`. Normally you run these scripts through `npm run` (ie `npm run start` or `npm run build`).

## Automatic Browser Refresh

When **webpack-dev-server** is running it will watch your files for changes. When that happens it rebundles your project and notifies browsers listening to refresh. If you try modifying **app/component.js** you should see the changes propagate to your browser now.

We can easily extend the approach to work with CSS. Webpack allows us to modify CSS without forcing a full refresh. Let's see how to achieve that next.

## Loading CSS

In order to load CSS to project, we'll need to use a couple of loaders. To get started, invoke `npm i css-loader style-loader --save-dev`. Now that we have the loaders we need, we'll need to make sure Webpack is aware of them. It's time to configure.

**webpack.development.js**

```javascript
var path = require('path');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:8080',
    'webpack/hot/dev-server',
    path.resolve(ROOT_PATH, 'app/main'),
  ],
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

One way to do this is to keep all configuration in `webpack.config.js` and control what it returns using an environment variable. The advantage of this approach is that you can see all the bits and pieces and how they relate to each other from single place. We can adapt this approach to our project quite easily.

In order to make it easier to deal with this arrangement I've developed a little custom merge utility known as `webpack-merge`. Install it using `npm i webpack-merge --save-dev` to your project. Compared to `merge` you might be used to this variant that concatenates arrays instead of replacing them. This is very useful with Webpack as we'll see below.

**webpack.config.js**

```javascript
var path = require('path');
var merge = require('webpack-merge');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: [path.resolve(ROOT_PATH, 'app/main')],
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
  module.exports = merge(common);
}

if(TARGET === 'dev') {
  module.exports = merge(common, {
    entry: ['webpack/hot/dev-server']
  });
}
```

The common configuration has been separated to a section of its own. In this case `build` configuration is actually the same as `common` configuration. We do a little tweak for `develop` case. As you can see the configuration is quite easy to follow this way.

To make everything work again, we'll need to tweak our `package.json` **scripts** section like this:

```json
...
"scripts": {
  "build": "TARGET=build webpack",
  "start": "TARGET=dev webpack-dev-server --devtool eval --progress --colors --hot --content-base build"
},
...
```

W> `TARGET=build` type of declarations won't work on Windows! You should use `set TARGET=build&& webpack` kind of syntax there. It is important it's `build&&` and not `build &&` as that will fail. Later on Webpack will allow env to be passed to it directly making this cross-platform. For now this will work.

You can also eliminate those old configuration files at the project root while at it.

If everything went fine, the old commands should work still. Now we have something a little tidier together that's possible to grow even further with minimal work.

## `WebpackDevServer` and `html-webpack-plugin`

In our current solution we've entangled our build and development version `index.html`. We definitely don't want reference to `http://localhost:8080/webpack-dev-server.js` to end up in our production version.

Fortunately we can resolve this problem by extending our system a little. We'll set up our own little server in which we'll wrap `WebpackDevServer` in addition we'll generate HTML of our production version dynamically with some hash so we get to benefit from client level caching.

### Setting up `html-webpack-plugin`

As a first step hit `npm i html-webpack-plugin --save-dev`. Get rid of `build/index.html`. We'll generate that dynamically next with some configuration.

**webpack.config.js**

```javascript
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var merge = require('webpack-merge');

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Kanban app'
      }),
    ],
  });
}
```

If you hit `npm run build` now, you should get output that's roughly equal to what we had earlier. We still need to make our development server work to get back where we started.

T> Note that you can pass a custom template to `html-webpack-plugin`. In our case the default template it uses is just fine for our purposes.

### Setting Up `WebpackDevServer`

We'll write a custom little server of ours for dealing with development. This will give us a bit more control and helps us to keep `package.json` neater. Set up `dev-server/server.js` like this:

**lib/dev_server.js**

```javascript
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var config = require('../webpack.config');

new WebpackDevServer(webpack(config), {
  contentBase: __dirname,
  publicPath: config.output.publicPath,
  historyApiFallback: true,
  stats: {
    colors: true,
  },
}).listen(config.port, config.ip, function(err) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at ' + config.ip + ':' + config.port);
});
```

The server has been configured in `hot` mode and it has `historyApiFallback` enabled. We'll get back to that `hot` setting in the React chapter. `historyApiFallback` will come in handy if/when our application has History API routing. It will allow us to access the application directly from the routes we have defined for it instead of having to go through root always.

**webpack.config.js**

```javascript
var webpack = require('webpack');

...

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
      path: ROOT_PATH,
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
```

In the Webpack configuration we make sure it includes Socket.io client and dev server bits. `webpack/hot/dev-server` will trigger full refresh in case it detects a change. Later on we will replace it with `webpack/hot/only-dev-server` which will work better with hot module reloading for React.

Finally we'll need to tweak `package.json`:

**package.json**

```
...
"scripts": {
  "build": "TARGET=build webpack",
  "start": "TARGET=dev node lib/dev_server.js"
},
...
```

If you hit `npm start` at `kanban_app/` now and start tweaking `app/component.js` you should see the browser refresh.

## Other Configuration Approaches

There is no one clear convention on how to deal with Webpack configuration. Given Webpack expects an object structure the way you generate it doesn't matter that much. The way you saw above is the one I find the most convenient as it allows you to share configuration easily while understanding what's going on.

Some people prefer to write a separate configuration file per target. In order to share configuration they write a factory function. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).

This approach can be taken even further. [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack) is an example of a Webpack based library that wraps common scenarios within an easier to use format. When using a library like this you don't have to worry about specific configuration as much. You will lose some power in the process but sometimes that can be acceptable.

In fact Webpack works well as a basis for more advanced tools. I've helped to develop a static site generator known as [Antwar](https://antwarjs.github.io/). It builds upon Webpack and React and hides a lot of the complexity of Webpack from the user. Webpack is a good fit for tools like this as it solves so many difficult problems well.

## Conclusion

Now we have a nice degree of separation between production and development builds. Initially Webpack tends to take some configuration work but after that working with it becomes faster as you start to think in terms of loaders and plugins and how those fit into your workflow. Webpack deals with the heavy lifting while you get to focus on development.

In this chapter you learned how to go beyond a basic Webpack configuration. Webpack's development server is a powerful feature that has even more in store. We also learned how to organize our configuration more effectively. Next we'll see how to configure Webpack to work well with React.
