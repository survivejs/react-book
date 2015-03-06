# Deployment

Getting your website or app to production can be a hurdle. It isn't entirely trivial with Webpack either but it can take care of a lot of menial details for you if you configure it right.

## Structuring Configuration

There are two things you want to do preparing for a production build.

1. Configure a script to run in your package.json file
2. Create a production config

### Creating the script

We have already used *package.json* to create the `npm run dev` script. Now let us set up `npm run deploy`.

```json
{
  "name": "my-project",
  "version": "0.0.0",
  "description": "My awesome project!",
  "main": "app/main.js",
  "scripts": {
    "dev": "webpack-dev-server --devtool eval --progress --colors --hot --content-base build",
    "deploy": "NODE_ENV=production webpack -p --config webpack.production.config.js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^1.4.13",
    "webpack-dev-server": "^1.6.6"
  },
  "dependencies": {}
}
```

As you can see we are just running webpack with the production argument and pointing to a different configuration file. We also use the environment variable "production" to allow our required modules to do their optimizations. Lets us create the config file now.

### Creating the Production Configuration

So there really is not much difference in creating the dev and production versions of your webpack config. You basically point to a different output path and there are no workflow configurations or optimizations. What you also want to bring into this configuration is cache handling.

```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,

      // There is not need to run the loader through
      // vendors
      exclude: [node_modules_dir],
      loader: 'babel'
    }]
  }
};

module.exports = config;
```

### Deploying

Run `npm run deploy` in the root of the project. Webpack will now run in production mode. It does some optimizations on its own, but also React JS will do its optimizations. Look into caching for even more production configuration.

## Single Bundle

Lets have a look at the simplest setup you can create for your application. Use a single bundle when:

- You have a small application
- You will rarely update the application
- You are not too concerned about perceived initial loading time

*webpack.production.config.js*
```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel'
    }]
  }
};

module.exports = config;
```

## Split App and Vendors

When your application is depending on other libraries, especially large ones like React JS, you should consider splitting those dependencies into its own vendors bundle. This will allow you to do updates to your application, without requiring the users to download the vendors bundle again. Use this strategy when:

- When your vendors reaches a certain percentage of your total app bundle. Like 20% and up 
- You will do quite a few updates to your application
- You are not too concerned about perceived initial loading time, but you do have returning users and care about optimizing the experience when you do updates to the application
- Users are on mobile

*webpack.production.config.js*
```javascript
var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
  entry: {
    app: path.resolve(__dirname, 'app/main.js'),
    vendors: ['react'] // And other vendors
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [node_modules_dir],
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};

module.exports = config;
```
This configuration will create two files in the `dist/` folder. **app.js** and **vendors.js**.

> Important! Remember to add both files to your HTML file, or you will get the error: `Uncaught ReferenceError: webpackJsonp is not defined`.

## Multiple Entry Points

Maybe you are building an application that has multiple urls. An example of this would be a solution where you have two, or more, different URLs responding with different pages. Maybe you have one user page and one admin page. They both share a lot of code, but you do not want to load all the admin stuff for normal users. That is a good scenario for using multiple entry points. A list of use cases could be:

- You have an application with multiple isolated user experiences, but they share a lot of code
- You have a mobile version using less components
- You have a typical user/admin application where you do not want to load all the admin code for a normal user

Let us create an example with a mobile experience using less components:

*webpack.production.config.js*
```javascript
var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
  entry: {
    app: path.resolve(__dirname, 'app/main.js'),
    mobile: path.resolve(__dirname, 'app/mobile.js'),
    vendors: ['react'] // And other vendors
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js' // Notice we use a variable
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [node_modules_dir],
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};

module.exports = config;
```

This configuration will create three files in the `dist/` folder. **app.js**, **mobile.js** and **vendors.js**. Most of the code in the **mobile.js** file also exists in **app.js**, but that is what we want. We will never load **app.js** and **mobile.js** on the same page.

## Lazy Loaded Entry Points

It is also possible to lazy load entry points. This means that you load parts of your application as they are requested. A typical scenario for this would be that your users only visits specific parts of the application. And an example of that would be twitter.com. You do not always visit your profile page, so why load the code for that? Here is a summary of requirements:

- You have a relatively big application where users can visit different parts of it
- You do care a lot about initial render time

*webpack.production.config.js*
```javascript
var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
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
      exclude: [node_modules_dir],
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};

module.exports = config;
```
So we are pretty much back where we started with a split application and vendors bundle. You do not really define your lazy dependencies in a configuration, Webpack automatically understands them when analyzing your code. So let us see how we would lazy load a **profile page**:

*main.js (Using ES6 syntax)*
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

So this is just an example. You would probably hook this up to a router, but the important part is using `require.ensure`.

**What is the array on the first argument?**: If you try to lazy load a chunk that depends on an other lazy loaded chunk you can set it as a dependency in the array. Just type in the path to the chunk. E.g. `['./FunnyButton.js']`

## Isomorphic App

So the great thing about React JS is that it runs on the server too. But that does not mean you can just create any app and run it on the server. You have to make some decisions on the architecture. The reason is that even though React JS and the components run on the server, you might be having dependencies in those components that does not run on the server.

## Injecting state
One of the most important decisions you make is to inject the state of your application through the top component. This basically means that your components does not have any external dependencies at all. All they need to know comes through this injected state.

This cookbook is not about isomorphic apps, but let us take a look at an example. We will not use ES6 syntax here because Node JS does not support it yet.

*main.js (client)*
```javascript
var React = require('react');
var AppState = require('./client/AppState.js');
var App = require('./App.js');

React.render(<App state={AppState}/>, document.body);
```

*router.js (server)*
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

So this was a very naive and simple way of showing it, but what yo should notice here is that we use the same **App.js** file on the client and server, but we have two different ways of producing the state.
