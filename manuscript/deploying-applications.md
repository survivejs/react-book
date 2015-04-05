# Deploying Applications

If you were developing a native application you would probably bundle everything into one file and deploy it to some application store. Deploying to the web requires more considerations. Though Webpack lets you bundle your application into one file, including CSS, images, fonts etc., Webpack can also help you optimize how the browser grabs the assets of your application to give the best possible user experience.

As there is no single right way to do this, we will cover a few different strategies you can use to approach this vital part. The strategy you’ll want to use depends entirely on your goals. With Webpack you can end up with something very highly optimized. This incurs some extra complexity to the configuration but your users will be very glad you gave that extra effort.

We’ll start with the simplest case possible, a single production bundle. We’ll just minify the assets and hope for the best. This approach is simple but doesn’t scale that well. Your users will probably meet the infamous “white screen of bad user experience”, if only for a few hundred milliseconds, waiting for your application to load.

This can be improved by splitting the bundles. The external dependencies of your application, like React, Underscore, Bootstrap etc. will likely require less updates than the core logic. We can separate them into a bundle separate from the one containing your logic and benefit from caching using hashing. Now you can deploy updates to the application logic and your users do not have to download the bundle containing the external dependencies . This isn’t ideal but it is better.

If we are dealing with an app that has multiple pages, we can move onto using a bundle per page. Why eat the whole pie when you only want a piece? This translates to a more concrete example where you only load assets needed to show the “profile” page. When the user clicks “admin” new assets will be loaded to display that page. This gives you a faster initial load of your application, but gives some latency when moving to pages that needs to download more assets. Webpack handles all this for you and we will show you how.

There is one more thing we can do. We can turn our application into an isomorphic one. Back in the day we just served HTML and sprinkled a bit of logic on top of it using JavaScript. Then at some point we started generating the HTML on the client using JavaScript and templates. Single Page Apps were born. This simplified model of app development came with a cost.

Having server rendered HTML available is beneficial because the users will not get a blank page while the JavaScript is loading. Web crawlers can benefit from this and as a result your SEO rankings are improved. The app is more performant and easier to consume. In addition we can preload some data to avoid queries. We will demonstrate this approach using React.

## Creating a Production Configuration

Creating a production configuration is not that much different from creating configuration for development. We'll use different paths for the output and avoid development workflow specific configuration. It is also common to add caching configuration to your production configuration.

To run the configuration and create a distribution for deployment we create a script. In addition to our existing `npm run dev` we will add `npm run prod`. What differs with our new production script is that it does not use the `webpack-dev-server`. We will only use webpack to produce a distribution. To make this work, we’ll need to tweak our `package.json` like this:

```
"scripts": {
  "dev": "webpack-dev-server --devtool eval --progress --colors --hot --content-base build",
  "prod": "NODE_ENV=production webpack -p --config webpack.production.js"
}
```

In `prod` we’ll make sure `NODE_ENV` PATH variable is set to production. This way the libraries we are using can use whatever optimizations they might have in store. For instance in case of React this would disable certain checks and improve performance. The `-p` argument puts Webpack in production mode where it does its optimizations, like minification.

We can achieve the same effect in our production configuration like this in case we want to simplify our `scripts` configuration:

```javascript
...
plugins: [
  new webpack.DefinePlugin({
    'process.env': {
       'NODE_ENV': JSON.stringify('production'),
    }
  }),
  ...
]
```

It is more verbose but on the other hand at least now it’s a part of the configuration itself.

## Single Bundle

If you are developing a simple application, or a demo, you can get away with a single bundle. It will contain all the JavaScript your app needs to run. In addition it will contain assets needed by your app including CSS, fonts and even images. As a result the loading time will be higher. Sometimes simple is beautiful, though.

The gotcha with this approach is that the generated bundle can be quite big. In addition if you make any changes to it, you will force your users to download everything again. We cannot leverage any form of caching effectively. That said, it’s a viable approach in the simplest of cases.

Given the following project file structure:

- app/main.js
- dist/
- package.json
- webpack.production.js

You can create a single bundle with the following configuration:

*webpack.production.js*
```javascript
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  }
};
```

Run `npm run prod` in the root of the project and a `bundle.js` file will be available in the `./dist` folder.

## Splitting App and Vendors

You will want to split app and vendors when your project consists of relatively large dependencies, compared to the project itself. This is beneficial when you do bug fixes or other changes to the application, as users does not need to download the vendors bundle again. The initial loading time of your application is not optimized compared to a single bundle, actually it is a bit slower because now you have to set up two HTTP requests to get the required assets. As with everything, it is about balance.

> Generally the more HTTP requests you have to fire, the slower things will get. Even though request payload itself might be small, each request comes with overhead. The overhead adds up quickly. This is the reason why clever bundling approaches are required. The situation is likely to change as HTTP/2 gets adopted. The situation is quite opposite there.

Given the following project file structure:

- app/main.js
- dist/
- node_modules/react
- package.json
- webpack.production.js

You can create a configuration like this:

**webpack.production.js**
```javascript
var path = require('path');
var webpack = require('webpack');
var nodeModulesDir = path.resolve(__dirname, 'node_modules');

module.exports = {
  entry: {
    app: [path.resolve(__dirname, 'app/main.js')],
    vendors: ['react']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};
```

This configuration will create two files in the `dist/` folder. **app.js** and **vendors.js**.

> Remember to add both files to your HTML file, or you will get the error: `Uncaught ReferenceError: webpackJsonp is not defined`.

Before we explain how the CommonsChunkPlugin works we should briefly look back to "Understanding Webpack". In the configuration above we have two **entry point chunks**, app and vendors. App consists of only one chunk and its children. That is our *main.js* file. The vendors entry point chunk also consists of only one chunk and its children. This is React itself. So an entry point chunk can be a merge of multiple chunks, but in this case it is only one each.

These two entry chunks and their individual children chunks will be bundled into two different JavaScript files, **app.js** and **vendors.js**. Both of the bundles has `react` as either part of the entry chunk itself, like vendors, or it is required with a `var React = require('react')` statement, like in app.

Understanding this, you can understand how the CommonsChunkPlugin works. In the example above, if we did not configure a plugin at all React would be included in both entry chunks, app and vendors, and bundled into both the *app.js* file and *vendors.js* file. By using a plugin we can tell Webpack that the chunks included in vendors are common.

That means when an other entry chunk, like app in this example, tries to require react it will first check  entry chunks defined as common. In our example, using the CommonsChunkPlugin, we say that the vendors entry chunk is common and when it is bundled, call that file *vendors.js*. The result of this is that we will now get two bundles, app.js and vendors.js, where app.js grabs react from vendors.js.

## Multiple Bundles

Let's say you are working on a big project and you have a family of applications. These applications have different functionality, but they still share a lot of code. With Webpack you can create completely separate bundles that share a single common bundle. How much should be shared is something Webpack can optimize for you.

Given the following project file structure:

- appA/main.js
- appB/main.js
- dist/
- node_modules/react
- package.json
- webpack.production.js

**webpack.production.js**

```javascript
var path = require('path');
var webpack = require('webpack');
var nodeModulesDir = path.resolve(__dirname, 'node_modules');

module.exports = {
  entry: {
    appA: path.resolve(__dirname, 'appA/main.js'),
    appB: path.resolve(__dirname, 'appB/main.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js' // Notice we use a variable
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js')
  ]
};
```

This configuration will create three files in the `dist/` folder. **appA.js**, **appB.js** and **common.js**. There are two things you should notice here:

1. We are using a variable in our output configuration. Since we have multiple entries we want to produce one file for each of them, using the name of the entry as the name of the file.

2. The CommonsChunkPlugin is now used a bit differently than in the previous strategy. Instead of pointing to an existing entry chunk, we create a brand new chunk called *common*. Its file name will be *common.js*. By default Webpack will make sure that if one entry chunk or its children require a chunk that also the other entry chunk or its children require, it will be moved over to the common chunk. This effectively moves vendors and shared chunks to the common bundle.

## Lazy Loaded Chunks

It is also possible to lazy load chunks. This means that you load parts of your application as they are requested. A typical scenario for this would be that your users only visits specific parts of the application. And an example of that would be twitter.com. You do not always visit your profile page, so why load the code for that? Here is a summary of requirements.

Given the following project file structure:

- app/main.js
- app/Profile.js
- dist/
- node_modules/react
- package.json
- webpack.production.js

**webpack.production.js**

```javascript
var path = require('path');
var webpack = require('webpack');
var nodeModulesDir = path.resolve(__dirname, 'node_modules');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'app/main.js'),
    vendors: ['react']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [nodeModulesDir],
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};
```

So we are pretty much back where we started with a split application and vendors bundle. You do not really define your lazy dependencies in a configuration, Webpack automatically understands them when analyzing your code. So let us see how we would lazy load a **profile page**:

**main.js (Using ES6 syntax)**

```javascript
import React from 'react';
import Feed from './Feed.js';

class App extends React.Component {
  constructor() {
    this.state = { currentComponent: Feed };
  }
  openProfile() {
    require.ensure([], () => {
      var Profile = require('./Profile.js');
      this.setState({
        currentComponent: Profile
      });
    });
  }
  render() {
   return (
      return <div>{this.state.currentComponent()}</div>
    );
  }
}
React.render(<App/>, document.body);
```

So this is just an example. You would probably hook this up to a router, but the important part is using `require.ensure`. When Webpack finds that statement it will automatically create a chunk that can be lazy loaded.

**What is the array on the first argument?**: If you try to lazy load a chunk that depends on an other lazy loaded chunk you can set it as a dependency in the array. Just type in the path to the chunk. E.g. `['./FunnyButton.js']`

## Isomorphic App

So the great thing about React is that it runs on the server too. But that does not mean you can just create any app and run it on the server. You have to make some decisions on the architecture. The reason is that even though React and the components run on the server, you might be having dependencies in those components that does not run on the server.

### Injecting state

One of the most important decisions you make is to inject the state of your application through the top component. This basically means that your components does not have any external dependencies at all. All they need to know comes through this injected state.

This cookbook is not about isomorphic apps, but let us take a look at an example. We will not use ES6 syntax here because Node JS does not support it yet.

**main.js (client)**

```javascript
var React = require('react');
var AppState = require('./client/AppState.js');
var App = require('./App.js');

React.render(<App state={AppState}/>, document.body);
```

**router.js (server)**

```javascript
var React = require('react');
var App = require('./App.js');
var AppState = require('./server/AppState.js');
var index = '<!DOCTYPE html><html><head></head><body>{{component}}</body></html>';

app.get('/', function (req, res) {
  var componentHtml = React.renderToString(App({state: AppState}));
  var html = index.replace('{{component}}', componentHtml);
  res.type('html');
  res.send(html);
});
```

So this was a very naive and simple way of showing it, but what you should notice here is that we use the same **App.js** file on the client and server, but we have two different ways of producing the state.
