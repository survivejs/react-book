# Developing with webpack

If you are not one of those guys that likes to skip introductions, you might have some clue what webpack is. In its simplicity it is a module bundler. It takes a bunch of assets in and outputs assets you can give to your client.

This sounds very simple but in practice it can be a very complicated and messy process. You definitely don't want to deal with all the details yourself. This is where webpack fits in. Next we'll get webpack set up and your first project running in development mode.

## Setting Up the Project

Webpack is one of those tools that depends on [Node.js](http://nodejs.org/). Make sure you have it installed and you can have `npm` available at your terminal. Next you should set a directory for your project, navigate there, hit `npm init` and fill in some details. You can just hit `return` for each and it will work. Here are the commands in detail:

```bash
mkdir kanban_app
cd kanban_app
npm init
# hit return a few times till you have gone through the questions
```

As a result you should have `package.json`. If you are into version control, as you should, this would be a good time to set up your repository. You can create commits as you progress with the project.

## Installing webpack

Next you should get webpack installed. We'll do a local install and save it as a project dependency. This will allow us to maintain webpack's version per project. Hit `npm i webpack node-libs-browser --save-dev`.

T> `node-libs-browser` is installed as it is a peer dependency of webpack. Starting from npm 3 it won't get installed automatically so it's a good idea to have it installed in order to be future-proof.

This is a good change to try to run webpack for the first time. Hit `node_modules/.bin/webpack`. You should see a version print, link to cli guide and a long list of options. We won't be using most of those but it's good to know that this tool is packed with functionality if nothing else.

Webpack works using a global install as well (`-g` or `--global` flag during installation) but it is preferred to keep it as a project dependency like this. The arrangement helps to keep your life simpler as you have direct control over the version you are running.

T> We are using `--save-dev` here instead of `--save` as we want to use webpack as a development dependency. Use `--save-dev` for parts you need to generate your distribution version. Otherwise `--save` is a good choice. This will give us more semantic `package.json` and makes our lives easier as we need to get back to the project later.

## Directory Structure

As projects with just `package.json` are very boring, we should set up something more concrete. Let's do a little web site that loads some JavaScript which we build using webpack. Set up a structure like this:

- /app
  - main.js
  - component.js
- /build
  - bundle.js (automatically generated, no need to create this)
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

In addition we need `index.html` that points to the bundle that webpack will generate.

**build/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

## Setting Up webpack Configuration

We'll need to tell webpack how to deal with the assets we just set up. For this purpose we'll build `webpack.config.js`. Webpack and its development server will be able to discover this file automatically through convention.

In order to map our application to *build/bundle.js* we are going to need configuration like this:

**webpack.config.js**

```javascript
var path = require('path');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: [
    path.resolve(ROOT_PATH, 'app/main')
  ],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  }
};
```

We use `path.resolve` here as it is preferred to use absolute paths with webpack. If you move your configuration below some directory, you'll need to take this into account. Alternatively you could use `path.join(__dirname, 'app', 'main')` and such but I like to use `path.resolve` for these.

If you hit `node_modules/.bin/webpack` now you can get a webpack build done. But we are not interested in builds. We want a proper development server to develop against.

## Setting Up `webpack-dev-server`

Now that we have basic building blocks together we can set up a development server. `webpack-dev-server` is a development server designed particularly development in mind. It will deal with refreshing browser as you develop. This makes it roughly equal to tools such as [LiveReload](http://livereload.com/) or [Browsersync](http://www.browsersync.io/). The greatest advantage webpack has over these tools is Hot Module Reloading (HMR) which we'll discuss when we go through React.

Hit `npm i webpack-dev-server --save-dev` at project root to get the server installed. We will be invoking our development server through npm. It allows us to set up `scripts` at `package.json`. In this case the following configuration is enough:

**package.json**

```json
...
"scripts": {
  "start": "webpack-dev-server --devtool eval --progress --colors --hot --inline --history-api-fallback --content-base build"
},
...
```

Hit `npm start` and surf to **localhost:8080**. You should see something familiar there. Try modifying `app/component.js` while the server is running and see what happens. Quite neat, huh?

T> If you want to use some other port than `8080`, you can pass `--port` parameter (e.g. `--port 4000`) to *webpack-dev-server*.

When you run `npm start` from your terminal it will execute the command mapping to `start` script of the `scripts` section. This is what it does:

1. `webpack-dev-server` - Starts a web service on `localhost:8080`
2. `--devtool eval` - Executes code through `eval` and attached `//@ sourceURL` annotations to it. After this you will see filename and line number where any errors are thrown. Use this for development only!
3. `--progress` - Will show progress of bundling your application
4. `--colors` - Colors in the terminal!
5. `--hot` - Enable hot module loading
6. `--inline` - Embeds the webpack-dev-server runtime into the bundle
7. `--history-api-fallback` - Allows HTML5 History API routes to work
8. `--content-base build` - Points to `build` so we can reuse `index.html` from there. We'll eliminate this later in this chapter

Alternatively we can run the application from **localhost:8080/webpack-dev-server/bundle** instead of root. It provides an iframe showing a status bar that indicates the status of the rebundling process.

## Refreshing CSS

We can easily extend the approach to work with CSS. webpack allows us to modify CSS without forcing a full refresh. Let's see how to achieve that next.

In order to load CSS to project, we'll need to use a couple of loaders. To get started, invoke `npm i css-loader style-loader --save-dev`. Now that we have the loaders we need, we'll need to make sure webpack is aware of them. Configure as follows.

**webpack.config.js**

```javascript
var path = require('path');

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
        loaders: ['style', 'css']
      }
    ]
  }
};
```

The configuration we added tells webpack that whenever it meets some file ending with `css` it should invoke the power of loaders in this specific order. This is done by matching against `test` regular expression.

Note that loaders are evaluated from right to left. In this case it will pass a possible CSS file to *css-loader* first and to *style-loader* after that. *css-loader* will resolve `@import` and `url` statements of our CSS files. *style-loader* deals with `require` statements in our JavaScript. Similar approach works with CSS preprocessors.

W> Although `['style', 'css']` type loader configuration can be convenient, it can lead to issues due to the way the lookup works. If you happened to have `css` named module installed at `node_modules`, it would try to use that instead of `css-loader` which we might expect!

We are missing just one bit, the actual CSS itself:

**app/main.css**

```css
body {
  background: cornsilk;
}
```

In addition we'll need to make webpack aware of this file:

**app/main.js**

```
require('./main.css');

...
```

Hit `npm start` now and point your browser to **localhost:8080** provided you are using the default port.

To see the magic in action, you should open up *main.css* and change the background color to something nice like `lime` (`background: lime`). Develop styles as needed to make it look a little nicer.

## Linting the Project

I discuss linting in detail at *Linting in webpack* chapter. Given setting up a linter is the most beneficial at the beginning of a project, not at the end, it may be worth your while to check out the chapter and expand the project configuration as you see fit.

Alternatively you can just skip it and carry on. The example project doesn't have linting set up but apart from that the code should be the same.

## Building the Project

Even though the project builds currently, it's not a very sophisticated build. I discuss building in more detail after we have developed the Kanban application.

## Conclusion

In this chapter you learned to build an effective development configuration using webpack. Webpack deals with the heavy lifting for you now. The current setup can be expanded easily to support more scenarios. Next we can see how to expand it to work with React well.
