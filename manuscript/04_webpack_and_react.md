# Webpack and React

![React](images/react_header.png)

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

## What is React?

React isn't a framework like Angular.js or Ember. Instead it's just a library focusing on the view layer. It introduced a concept known as virtual DOM to web developers. This means that instead of manipulating DOM directly just like all the libraries and frameworks before it, React maintains a DOM of its own. As changes are made to virtual DOM, React will batch the changes to actual DOM as it sees best.

This has meant that the developers of React have decoupled themselves from the limitations of DOM. As a result React is highly performant although this comes with a cost. The library isn't as small as you might expect. You can expect bundle sizes for small applications to be around 150-200k, React included. That is considerably less when gzipped over wire but it's still something.

Even if React isn't the smallest library out there it does manage to solve some serious problems. It is a pleasure to develop with thanks to its relative simplicity and powerful API. You will need to complement with a set of tools but you can pick these based on actual need. It's far from a "one size fits all" type of solution which frameworks tend to be.

The approach used by React allowed Facebook to develop React Native on top of the same ideas. This time instead of DOM, we are operating on mobile platform rendering. React Native provides abstraction over components and layout system while providing you the setup you already know from the web. It can be seen as a gateway for web developers wanting to develop performant mobile applications.

Webpack and React work well together. By now we understand how to set up a simple project. We can extend it to work with React easily. Before we get to implement anything serious, it's a good idea to make sure we have a decent development environment. That will make everything so much easier.

## Installing React

To get started install React to your project. Just hit `npm i react --save` and you should be set. As a next step we could port our **app/component.js** to React. Provided we use ES6 module and class syntax and JSX, we can go with a solution like this:

**app/components/App.jsx**

```javascript
import React from 'react';
import Note from './Note';

export default class App extends React.Component {
  render() {
    return <Note />;
  }
}
```

`App` will work as an entry point to our application. Later on it will orchestrate logic etc.

We also need to define that `Note` component:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>Learn Webpack</div>;
  }
}
```

T> Note that we're using *jsx* extension here to tell modules using JSX syntax apart from regular ones. This is a good convention to have.

In addition we'll need to adjust our `main.js` to render the component correctly. Note that I've renamed it as `main.jsx` given we have JSX content there. Here's one solution:

**app/main.jsx**

```javascript
import './stylesheets/main.css';

import React from 'react';
import App from './components/App';

main();

function main() {
    var app = document.createElement('div');
    document.body.appendChild(app);

    React.render(<App />, app);
}
```

W> Avoid rendering directly to `document.body`. This can cause strange problems with relying on it. Instead give React a little sandbox of its own.

## Babel

![Babel](images/babel.png)

[Babel](https://babeljs.io/) is one of those projects that has made a big impact on the community. It allows us to use features from the future of JavaScript. It will transform your futuristic code to a format browsers understand. Besides providing functionality it allows you to develop your own language features. In addition it comes with JSX support. That will come in handy here.

In addition to the standardized ES6 features Babel provides support for certain [experimental features](https://babeljs.io/docs/usage/experimental/) from ES7. Some of these might make it to the core language while some might be dropped altogether. The language proposals have been categorized within stages. Stage 0 is a strawman, stage 1 a proposal, stage 2 draft and so on.

I would be especially careful with stage 0 as if a stage 0 feature you are depending upon goes away you'll have to rewrite some of your code. But in smaller projects that may be worth the risk. Babel has stage 2 and higher features enabled by default. In our project we'll enable stage 1 to use decorators and property spreading as they will make our code a little tidier.

T> You can [try out Babel online](https://babeljs.io/repl/) to see what kind of code it generates.

### Configuring babel-loader

In order to set up Babel for our project we can use [babel-loader](https://www.npmjs.com/package/babel-loader). Install it using `npm i babel-loader --save-dev`. In addition add the following loader declaration to the *loaders* section of your configuration:

**webpack.config.js**

```javascript
var common = {
  ...
  module: {
    loaders: [
      {
        // test for both js and jsx
        test: /\.jsx?$/,

        // use babel loader with Stage 1 features
        loader: 'babel?stage=1',

        // operate only on our app directory
        include: path.resolve(ROOT_PATH, 'app'),
      },
      ...
    ]
  },
  ...
};
```

We will specifically include our `app` source to our loader. This way Webpack doesn't have to traverse whole source. Particularly going through `node_modules` can take a while. You can try taking `include` statement out to see how that affects the performance.

T> We'll be using certain Stage 1 (proposal) features later on in this book so it's a good idea to have that set up. It is possible they will receive updates later on. Especially Stage 0 features are subject to change. You can find more information at [Babel documentation](https://babeljs.io/docs/usage/experimental/).

Webpack traverses `['', '.webpack.js', '.web.js', '.js']` files by default. This will get problematic with our `import Note from './Note';` statement. In order to make it find JSX, we'll need to add another piece of configuration like this:

**webpack.config.js**

```javascript
var common = {
  entry: [path.resolve(ROOT_PATH, 'app/main')],
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  ...
};
```

If you hit `npm run build` now, you should get some output after a while. Here's a sample:

```bash
> TARGET=build webpack

Hash: e528fefc32654263da5f
Version: webpack 1.9.6
Time: 2008ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     650 kB       0  [emitted]  main
index.html  204 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

As you can see, the output is quite chunky!

## Optimizing Build Size

We can resolve this issue by minifying our build. As easy way to do this is to pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your Webpack configuration:

**webpack.config.js**

```javascript
var webpack = require('webpack');

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
      }),
    ],
  });
}
```

If you hit `npm run build` now, you should see better results:

```bash
> TARGET=build webpack

Hash: d2df9c8478b9894d8d5e
Version: webpack 1.9.6
Time: 5517ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     172 kB       0  [emitted]  main
index.html  204 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about but may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get in an optimized manner. This will disable some checks (ie. property type checks) but it will give you a smaller build and improved performance.

In Webpack terms you can add the following snippet to the `plugins` section of your configuration like this:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // This has effect on the react lib size
          'NODE_ENV': JSON.stringify('production'),
        }
      }),
      ...
    ],
  });
}
```

T> That `JSON.stringify` is needed as Webpack will perform string replace "as is". In this case we'll want to end up with strings as that's what various comparisons expect, not just `production`. Latter would just cause an error.

Hit `npm run build` again and you should see improved results:

```bash
> TARGET=build webpack

Hash: 6fc5ea486a0560f13c59
Version: webpack 1.9.6
Time: 4709ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     123 kB       0  [emitted]  main
index.html  204 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 158 hidden modules
```

So we went from 650k to 172k and finally to 123k. The final build is a little faster than the previous one. As that 123k can be served gzipped, it is very reasonable. As we add dependencies to the project the size will grow. Then we will have to apply some other strategies and be smarter about loading. Fortunately we can do all that with Webpack when the time comes.

## Activating Hot Loading for Development

If you hit `npm start`, hit *localhost:8080* and try to modify our component (make it output `Learn React` or something), you'll see it actually works. After a flash. That's a little unfortunate especially if our application is more complex and has state. It is annoying to manipulate the user interface back to the state in which it was in order to test something.

We can work around this problem using hot loading. This is enabled by [react-hot-loader](https://gaearon.github.io/react-hot-loader/). It will swap React components one by one as they change without forcing a full refresh. There will be times when that will be necessary but it will help a lot. Once you get used to hot loading, it is hard to live without.

To enable hot loading for React, you should perform `npm i react-hot-loader --save-dev` and tweak the configuration as follows:

**webpack.config.js**

```javascript
var common = {
  ...
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      },
    ],
  },
  ...
};

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel?stage=1',
          include: path.resolve(ROOT_PATH, 'app'),
        },
      ],
    },
    plugins: [
      ...
    ],
  });
}

if(TARGET === 'dev') {
  module.exports = merge(common, {
    entry: [
      'webpack-dev-server/client?http://localhost:8080',
      'webpack/hot/dev-server'
    ],
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel?stage=1'],
          include: path.resolve(ROOT_PATH, 'app'),
        },
      ],
    },
  });
}
```

Try hitting `npm start` again and modifying the component. Note what doesn't happen this time. There's no flash! It might take a while to sink in but in practice this is a powerful feature. Small things such as this add up and make you more effective.

## Conclusion

You should understand how to set up React with Webpack now. In the process we saw how to develop Webpack configuration and learned a few new concepts. This is the way you work with Webpack. You'll find loaders as you require them and integrate them to your project.

Now that we have a good development environment, we can focus on React development more fully. In the next chapter you will see how to implement a little Todo application. That will be improved in the subsequent chapters into a full blown Kanban table.
