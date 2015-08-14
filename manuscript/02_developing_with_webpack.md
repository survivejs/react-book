# Developing with Webpack

If you are not one of those people who likes to skip introductions, you might have some clue what webpack is. In its simplicity it is a module bundler. It takes a bunch of assets in and outputs assets you can give to your client.

This sounds very simple but in practice it can be a very complicated and messy process. You definitely don't want to deal with all the details yourself. This is where webpack fits in. Next we'll get webpack set up and your first project running in development mode.

## Setting Up the Project

Webpack is one of those tools that depends on [Node.js](http://nodejs.org/). Make sure you have it installed and you can have `npm` available at your terminal. Next you should set a directory for your project, navigate there, hit `npm init` and fill in some details. You can just hit *return* for each and it will work. Here are the commands in detail.

```bash
mkdir kanban_app
cd kanban_app
npm init
# hit return a few times till you have gone through the questions
```

As a result you should have `package.json` at your project root. If you are into version control, as you should, this would be a good time to set up your repository. You can create commits as you progress with the project.

## Installing webpack

Next you should get webpack installed. We'll do a local install and save it as a project dependency. This will allow us to maintain webpack's version per project. Hit

> npm i webpack node-libs-browser --save-dev

T> `node-libs-browser` is installed as it is a peer dependency of webpack. Starting from npm 3 it won't get installed automatically so it's a good idea to have it installed in order to be future-proof.

This is a good opportunity to try to run webpack for the first time. Hit `node_modules/.bin/webpack`. You should see a version print, link to the cli guide and a long list of options. We won't be using most of those but it's good to know that this tool is packed with functionality if nothing else.

Webpack works using a global install as well (`-g` or `--global` flag during installation) but it is preferred to keep it as a project dependency like this. The arrangement helps to keep your life simpler as you have direct control over the version you are running.

We will be using `--save` and `--save-dev` to get a separation between application and development dependencies. The separation keeps project dependencies more understandable. This will come in handy when we generate a vendor bundle later on.

T> There are handy shortcuts for `--save` and `--save-dev`. `-S` maps to `--save` and `-D` to `--save-dev`. So if you want to optimize for characters written, consider using these instead.

## Directory Structure

As projects with just `package.json` are very boring, we should set up something more concrete. Let's do a little web site that loads some JavaScript which we then build using webpack. Set up a structure like this:

- /app
  - main.js
  - component.js
- /build (automatically generated, no need to create this)
  - bundle.js
  - index.html
- package.json
- webpack.config.js

In this case we'll generate `bundle.js` using webpack based on our `/app`. To make this possible, let's set up some assets and `webpack.config.js`.

## Setting Up Assets

As you never get tired of `Hello world`, we might as well model a variant of that. Set up a component like this.

**app/component.js**

```javascript
module.exports = function () {
  var element = document.createElement('h1');

  element.innerHTML = 'Hello world';

  return element;
};
```

Next we are going to need an entry point for our application. It will simply `require` our component and render it through DOM.

**app/main.js**

```javascript
var component = require('./component');
var app = document.createElement('div');

document.body.appendChild(app);

app.appendChild(component());
```

## Setting Up Webpack Configuration

We'll need to tell webpack how to deal with the assets we just set up. For this purpose we'll build `webpack.config.js`. Webpack and its development server will be able to discover this file automatically through convention.

To keep things nice and simple, we'll be generating an entry point to our application using `html-webpack-plugin`. It will generate links to possible assets automatically and keep our life simple. Hit

> npm i html-webpack-plugin --save-dev

to install it to the project.

In order to map our application to *build/bundle.js* and generate *build/index.html* we are going to need configuration like this:

**webpack.config.js**

```javascript
var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: path.resolve(ROOT_PATH, 'app/main'),
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Kanban app'
    })
  ]
};
```

Given webpack expects absolute paths we have some good options here. I like to use `path.resolve` but `path.join` would be a good alternative. `path.resolve` is equivalent to navigating the file system through *cd* whereas `path.join` gives you just that, a join. See [Node.js path API](https://nodejs.org/api/path.html) for the exact details.

If you hit `node_modules/.bin/webpack` now you should see a webpack build. You can try serving */build* through a dummy server such as *serve* (`npm i serve --global` and `serve`in the directory) and examine the results in a browser.

Even though this is nice it's not useful for development. We can set up something far better for development usage.

T> Note that you can pass a custom template to `html-webpack-plugin`. In our case the default template it uses is fine for our purposes for now.

## Setting Up `webpack-dev-server`

Now that we have the basic building blocks together we can set up a development server. `webpack-dev-server` is a development server designed particularly development in mind. It will deal with refreshing browser as you develop.

This makes it roughly equal to tools such as [LiveReload](http://livereload.com/) or [Browsersync](http://www.browsersync.io/). The greatest advantage webpack has over these tools is hot module reloading (HMR) which we'll discuss when we go through React.

Hit

> npm i webpack-dev-server --save-dev

at the project root to get the server installed. We will be invoking our development server through npm. It allows us to set up `scripts` at `package.json`. In this case the following configuration is enough:

**package.json**

```json
...
"scripts": {
  "start": "webpack-dev-server"
},
...
```

We also need to do some configuration work.

**webpack.config.js**

```javascript
...
var webpack = require('webpack');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  ...
  devServer: {
    colors: true,
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    ...
  ]
};
```

Hit `npm start` and surf to **localhost:8080**. You should see something familiar there. Try modifying `app/component.js` while the server is running and see what happens. Quite neat, huh?

Alternatively we can run the application from **localhost:8080/webpack-dev-server/bundle** instead of root. It provides an iframe showing a status bar that indicates the status of the rebundling process.

T> If you want to use some other port than `8080`, you can pass `port` parameter (e.g. `port: 4000`) to *devServer*.

In addition to **webpack.config.js** it is possible to set *webpack-dev-server* configuration through cli. There is also an entire [Node.js API](https://webpack.github.io/docs/webpack-dev-server.html#api) available in case you want maximum control over it.

W> Note that there are [slight differences](https://github.com/webpack/webpack-dev-server/issues/106) between the cli and Node.js API and they may behave slightly differently at times. This is the reason why some prefer to use solely Node.js API.

We are using a somewhat basic setup here. Beyond defaults we've enabled a couple of useful features, namely hot module loading (HMR) and HTML5 History API fallback. The former will come in handy when we discuss React in detail. Latter allows HTML5 History API routes to work. *inline* setting embeds the *webpack-dev-server* runtime into the bundle allowing HMR to work easily. Otherwise we would have to set up additional `entry` paths.

## Refreshing CSS

We can easily extend the approach to work with CSS. Webpack allows us to modify CSS without forcing a full refresh. Let's see how to achieve that next.

In order to load CSS to project, we'll need to use a couple of loaders. To get started, invoke

> npm i css-loader style-loader --save-dev

Now that we have the loaders we need, we'll need to make sure webpack is aware of them. Configure as follows.

**webpack.config.js**

```javascript
var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: path.resolve(ROOT_PATH, 'app/main'),
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: path.resolve(ROOT_PATH, 'app')
      }
    ]
  },
  ...
};
```

The configuration we added tells webpack that whenever it meets some file ending with `css` it should invoke the power of loaders in this specific order. This is done by matching against `test` regular expression.

Note that loaders are evaluated from right to left. In this case it will pass a possible CSS file to *css-loader* first and to *style-loader* after that. *css-loader* will resolve `@import` and `url` statements of our CSS files. *style-loader* deals with `require` statements in our JavaScript. Similar approach works with CSS preprocessors.

W> If `include` isn't set, webpack will traverse all files within the base directory. This can hurt performance! It is a good idea to set up `include` always. There's also `exclude` option that may come in handy.

We are missing just one bit, the actual CSS itself:

**app/main.css**

```css
body {
  background: cornsilk;
}
```

In addition, we'll need to make webpack aware of this file:

**app/main.js**

```javascript
require('./main.css');

...
```

Hit `npm start` now and point your browser to **localhost:8080** provided you are using the default port.

To see the magic in action, you should open up *main.css* and change the background color to something nice like `lime` (`background: lime`). Develop styles as needed to make it look a little nicer.

## Making the Configuration Extensible

In order to make room for later production configuration we can prepare our current one for it. There are multiple ways to approach the problem. Some people prefer to write a separate configuration file per target. In order to share configuration they write a factory function. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).

This approach can be taken even further. [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack) is an example of a webpack based library that wraps common scenarios into an easier to use format. When using a library like this you don't have to worry about specific configuration as much. You will lose some power in the process but sometimes that can be acceptable.

T> Webpack works well as a basis for more advanced tools. I've helped to develop a static site generator known as [Antwar](https://antwarjs.github.io/). It builds upon webpack and React and hides a lot of the complexity of webpack from the user. Webpack is a good fit for tools like this as it solves so many difficult problems well.

I have settled with a single configuration file based approach. The idea is that there's a smart `merge` function that overrides objects and concatenates arrays. This works well with webpack configuration given that's what you want to do most of the time. In this approach the configuration block to use is determined based on an environment variable. The biggest advantage of this approach is that it allows you to see all relevant configuration at one glance.

### Setting Up Configuration Target for `npm start`

As discussed we'll be using a custom `merge` function for sharing configuration between targets. Hit

> npm i webpack-merge --save-dev

to add it to the project. Add `merge` stub as below. The idea is that we detect npm lifecycle event (`start`, `build`, ...) and then branch and merge based on that. We'll expand these in the coming chapters.

In order to improve debuggability of the application we can set up sourcemaps while we are at it. These allow you to get proper debug information at the browser. You'll see exactly where an error was raised for instance. In webpack this is controlled through the `devtool` setting. We can use decent defaults as follows:

**webpack.config.js**

```javascript
var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');

var TARGET = process.env.npm_lifecycle_event;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: path.resolve(ROOT_PATH, 'app/main'),
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: path.resolve(ROOT_PATH, 'app')
      }
    ]
  }
  ...
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      colors: true,
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}
```

The idea behind `if(TARGET === 'start' || !TARGET) {` check is that if `TARGET` isn't set for reason or another, we still have some sane default configuration in place. This can happen if we execute webpack outside of npm.

If you run the development build now using `npm start`, webpack will generate sourcemaps. Webpack provides multiple different ways to generate them as discussed in the [official documentation](https://webpack.github.io/docs/configuration.html#devtool). In this case we're using `eval-source-map`. It builds slowly initially but it provides fast rebuild speed and yields real files.

Faster development specific options such as `cheap-module-eval-source-map` and `eval` produce lower quality sourcemaps. Especially `eval` is fast and is the most suitable for very large projects.

It is possible you may need to enable sourcemaps at your browser for this to work. See [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging) and [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map) instructions for further details.

Configuration could contain more sections such as these based on your needs. Later on we'll develop another section to generate a production build.

## Linting the Project

I discuss linting in detail in the *Linting in webpack* chapter. Given setting up a linter is the most beneficial at the beginning of a project, not at the end, it may be worth your while to check out the chapter and expand the project configuration as you see fit. This can save some frustration during development as you can see potential issues earlier.

## Conclusion

In this chapter you learned to build an effective development configuration using webpack. Webpack deals with the heavy lifting for you now. The current setup can be expanded easily to support more scenarios. Next we will see how to expand it to work with React.
