# Deploying Applications

If you were developing a native application you would probably bundle everything into one file and deploy it to some application store. Size probably wouldn't matter that much. Web is different. You can get quite far with a single bundle but at a certain point that becomes unwieldy. This is the area where webpack excels. It will allow you to shape your bundles just the way you like it. In this chapter I will discuss more general strategies for dealing with it.

The strategy you’ll want to use depends entirely on your goals. With webpack you can end up with something very highly optimized. This incurs some extra complexity to the configuration but your users will be very glad you gave that extra effort. So far you've seen how to set up a basic minified bundle. The next step would be to split a vendor chunk from it.

## Splitting App and Vendors

Separating app and vendors can make sense when your dependencies are large compared to the project itself. This is beneficial when you do bug fixes or other changes to the application. In that case your users would just need to download your app bundle in case the vendor bundle remains unchanged. Compared to a single bundle initial loading will be slightly slower since each request comes with a slight overhead. But given we can leverage caching it's not a bad price to pay.

T> Generally the more HTTP requests you have to fire, the slower things will get. Even though request payload itself might be small, each request comes with overhead. The overhead adds up quickly. This is the reason why clever bundling approaches are required. The situation is likely to change as HTTP/2 gets adopted. The situation is quite opposite there.

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

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: {
    app: path.resolve(ROOT_PATH, 'app/main'),
    vendor: ['react']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: 'app.[chunkhash].js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.[chunkhash].js')
  ]
};
```

This configuration will create two files in the `dist/` folder. **app.js** and **vendors.js**.

T> Remember to add both files to your HTML file, or you will get the error: `Uncaught ReferenceError: webpackJsonp is not defined`.

T> That `[chunkhash]` up there is used for generating a unique id per chunk for caching. If chunk contents change, so does the hash. And as a result your client will reload the file. See [long term caching](http://webpack.github.io/docs/long-term-caching.html) section at the official documentation for more information about the topic.

The entry chunks and their individual children chunks will be bundled into two different JavaScript files, **app.js** and **vendors.js**. Both of the bundles has `react` as either part of the entry chunk itself, like vendors, or it is required with a `var React = require('react')` statement, like in app.

Understanding this, you can understand how the CommonsChunkPlugin works. In the example above, if we did not configure a plugin at all React would be included in both entry chunks, app and vendors, and bundled into both the *app.js* file and *vendors.js* file. By using a plugin we can tell webpack that the chunks included in vendors are common.

That means when an other entry chunk, like app in this example, tries to require react it will first check  entry chunks defined as common. In our example, using the CommonsChunkPlugin, we say that the vendors entry chunk is common and when it is bundled, call that file **vendors.js**. The result of this is that we will now get two bundles, app.js and vendors.js, where app.js grabs React from vendors.js.

## Multiple Bundles

Let's say you are working on a big project and you have a family of applications. These applications have different functionality, but they still share a lot of code. With webpack you can create completely separate bundles that share a single common bundle. How much should be shared is something webpack can optimize for you.

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

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: {
    appA: path.resolve(ROOT_PATH, 'appA/main.js'),
    appB: path.resolve(ROOT_PATH, 'appB/main.js')
  },
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: '[name].js' // Notice we use a variable
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('common', 'common.js')
  ]
};
```

This configuration will create three files in the `dist/` folder. **appA.js**, **appB.js** and **common.js**. There are two things you should notice here:

1. We are using a variable in our output configuration. Since we have multiple entries we want to produce one file for each of them, using the name of the entry as the name of the file.

2. The CommonsChunkPlugin is now used a bit differently than in the previous strategy. Instead of pointing to an existing entry chunk, we create a brand new chunk called *common*. Its file name will be *common.js*. By default webpack will make sure that if one entry chunk or its children require a chunk that also the other entry chunk or its children require, it will be moved over to the common chunk. This effectively moves vendors and shared chunks to the common bundle.

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

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: {
    app: path.resolve(ROOT_PATH, 'app/main.js'),
    vendors: ['react']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: 'app.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [path.resolve(ROOT_PATH, 'node_modules')],
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};
```

So we are pretty much back where we started with a split application and vendors bundle. You do not really define your lazy dependencies in a configuration, webpack automatically understands them when analyzing your code. So let us see how we would lazy load a **profile page**:

**main.js**

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

So this is just an example. You would probably hook this up to a router, but the important part is using `require.ensure`. When webpack finds that statement it will automatically create a chunk that can be lazy loaded.

T> **What is the array on the first argument?**: If you try to lazy load a chunk that depends on an other lazy loaded chunk you can set it as a dependency in the array. Just type in the path to the chunk; e.g. `['./FunnyButton.js']`

## Isomorphic App

So the great thing about React is that it runs on the server too. But that does not mean you can just create any app and run it on the server. You have to make some decisions on the architecture. The reason is that even though React and the components run on the server, you might have dependencies in those components that do not run on the server.

One of the most important decisions you make is to inject the state of your application through the top component. This basically means that your components do not have any external dependencies at all. All they need to know comes through this injected state.

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

## Conclusion

In this chapter you saw some common strategies to help you deal with deployment. This is an area where webpack shines. You can configure it in various way to suit your purposes as you saw above.
