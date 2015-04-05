# Webpack and React.js

Webpack and React.js make an amazing combination when used together. The tooling enables a modern workflow that speeds up your development flow immensely. It will take a bit of setup but once you have it running it's just great.

## Installing React.js

`npm install react --save`

There is really nothing more to it. You can now start using React JS in your code.

## Using React.js in the code

*In any file*
```javascript
import React from 'react';

export default React.createClass({
  render: function () {
    return React.createElement('h1', null, 'Hello world');
  }
});
;
```

## Converting JSX

To use the JSX syntax you will need webpack to transform your JavaScript. This is the job of a loader.

`npm install jsx-loader --save-dev`

Now we have to configure Webpack to use this loader.

*webpack.config.js*
```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/, // A regexp to test the require path
      loader: 'jsx' // The module to load. "jsx" is short for "jsx-loader"
    }]
  }
};

module.exports = config;
```

Webpack will test each path required in your code. In this project we are using ES6 module loader syntax, which means that the require path of `import MyComponent from './Component.jsx';` is `'./Component.jsx'`.

## Changing the Component file and running the code

In the `/app` folder we now change the filename of our *Component.js* file to **Component.jsx**.

*Component.jsx*
```javascript
import React from 'react';

export default React.createClass({
  render: function () {
    return <h1>Hello world!</h1>
  }
});
```

We have now changed the return statement of our render method to use JSX syntax. Run `npm run dev` in the console and refresh the page, unless you are already running.

## Trying Out Babel

Instead of using a specific JSX loader you can use Babel that also gives you tomorrows JavaScript today. Instead of `jsx-loader` we will install `babel-loader`. If you have not heard of babel, you must check out [babel.io](https://babeljs.io/). It is a JavaScript transpiler that allows you to use JavaScript functionality that has not yet been implemented in the browser. Included is a JSX transpiler.

## Installing the Babel loader

`npm install babel-loader --save-dev` and in your config:

*webpack.config.js*
```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
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
Now you can use all the functionality Babel provides.

## Classes

As of React JS 0.13 you will be able to define components as classes.

```javascript
class MyComponent extends React.Component {
  constructor() {
    this.state = {message: 'Hello world'};
  }
  render() {
    return (
      <h1>{this.state.message}</h1>
    );
  }
}
```

This gives you a very short and nice syntax for defining components. A drawback with using classes though is the lack of mixins. That said, you are not totally lost. Lets us see how we could still use the important **PureRenderMixin**.

```javascript
import React from 'react/addons';

class Component extends React.Component {
  shouldComponentUpdate() {
    return React.addons.PureRenderMixin.shouldComponentUpdate.apply(this, arguments);
  }
}

class MyComponent extends Component {
  constructor() {
    this.state = {message: 'Hello world'};
  }
  render() {
    return (
      <h1>{this.state.message}</h1>
    );
  }
}
```

## Optimizing Rebundling

You might notice after requiring React.js into your project that the time it takes from a save to a finished rebundle of your application takes more time. In development you ideally want from 200-800 ms rebundle speed, depending on what part of the application you are working on.

## Running minified file in development

Instead of making Webpack go through React.js and all its dependencies, you can override the behavior in development.

*webpack.config.js*
```javascript
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  resolve: {
    alias: {
      'react': pathToReact
    }
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    noParse: [pathToReact]
  }
};

module.exports = config;
```
We do two things in this configuration:

1. Whenever "react" is required in the code it will fetch the minified React.js file instead of going to *node_modules*

2. Whenever Webpack tries to parse the minified file, we stop it, as it is not necessary

Take a look at `Optimizing development` for more information on this.

> TBD: point at the correct chapter here

## Type Checking with Flow

If you come to JavaScript from other programming languages you are familiar with types. You have types in JavaScript too, but you do not have to specify these types when declaring variables, receiving arguments etc. This is one of the things that makes JavaScript great, but at the same time not so great.

Specifically when working on very large projects with many developers type checking gives stability to your project, much like a good test does. So using **Flow** is definitely not a requirement. It is for developers who depends on type checking as more of a routine and for the before mentioned large projects with many developers. Webpack makes it easy to include **Flow** in your workflow.

### Installing flow

- Have to try this out :-)
- What about "flowcheck-loader", tried it? https://www.npmjs.com/package/flowcheck-loader (probably works, haven't tried this one yet)
- https://tryflow.org/

> TBD: expand this section
