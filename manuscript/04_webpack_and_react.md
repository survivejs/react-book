# webpack and React

![React](images/react_header.png)

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

## What is React?

React isn't a framework like Angular.js or Ember. Instead it's just a library focusing on the view layer. It introduced a concept known as virtual DOM to web developers. This means that instead of manipulating DOM directly just like all the libraries and frameworks before it, React maintains a DOM of its own. As changes are made to virtual DOM, React will batch the changes to actual DOM as it sees best.

This has meant that the developers of React have decoupled themselves from the limitations of DOM. As a result React is highly performant although this comes with a cost. The library isn't as small as you might expect. You can expect bundle sizes for small applications to be around 150-200k, React included. That is considerably less when gzipped over wire but it's still something.

Even if React isn't the smallest library out there it does manage to solve some serious problems. It is a pleasure to develop with thanks to its relative simplicity and powerful API. You will need to complement with a set of tools but you can pick these based on actual need. It's far from a "one size fits all" type of solution which frameworks tend to be.

The approach used by React allowed Facebook to develop React Native on top of the same ideas. This time instead of DOM, we are operating on mobile platform rendering. React Native provides abstraction over components and layout system while providing you the setup you already know from the web. It can be seen as a gateway for web developers wanting to develop performant mobile applications.

webpack and React work well together. By now we understand how to set up a simple project. We can extend it to work with React easily. Before we get to implement anything serious, it's a good idea to make sure we have a decent development environment. That will make everything so much easier.

## Babel

![Babel](images/babel.png)

[Babel](https://babeljs.io/) is one of those projects that has made a big impact on the community. It allows us to use features from the future of JavaScript. It will transform your futuristic code to a format browsers understand. Besides providing functionality it allows you to develop your own language features. In addition it comes with JSX support. That will come in handy here.

In addition to the standardized ES6 features Babel provides support for certain [experimental features](https://babeljs.io/docs/usage/experimental/) from ES7. Some of these might make it to the core language while some might be dropped altogether. The language proposals have been categorized within stages. Stage 0 is a strawman, stage 1 a proposal, stage 2 draft and so on.

I would be especially careful with stage 0 as if a stage 0 feature you are depending upon goes away you'll have to rewrite some of your code. But in smaller projects that may be worth the risk. Babel has stage 2 and higher features enabled by default. In our project we'll enable stage 1 to use decorators and property spreading as they will make our code a little tidier.

T> You can [try out Babel online](https://babeljs.io/repl/) to see what kind of code it generates.

### Configuring babel-loader

In order to set up Babel for our project we can use [babel-loader](https://www.npmjs.com/package/babel-loader). Install it using `npm i babel-core babel-loader --save-dev`. `babel-core` is a peer dependency of `babel-loader` so that needs to be installed explicitly to make the project work with npm 3. In addition add the following loader declaration to the *loaders* section of your configuration:

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
        include: path.resolve(ROOT_PATH, 'app')
      },
      ...
    ]
  },
  ...
};
```

We will specifically include our `app` source to our loader. This way webpack doesn't have to traverse whole source. Particularly going through `node_modules` can take a while. You can try taking `include` statement out to see how that affects the performance.

T> We'll be using certain Stage 1 (proposal) features later on in this book. Especially Stage 0 features are subject to change so that's why it's a good idea to be a little careful with them. Babel comes with Stage 2 (draft) enabled by default. You can find more information at [Babel documentation](https://babeljs.io/docs/usage/experimental/).

T> Another way to deal with Babel configuration would be to define a [.babelrc](https://babeljs.io/docs/usage/babelrc/) file in the project root. It would contain default settings used by Babel. It's the same idea as for ESLint and many other tools.

webpack traverses `['', '.webpack.js', '.web.js', '.js']` files by default. This will get problematic with our `import Note from './Note';` statement. In order to make it find JSX, we'll need to add another piece of configuration like this:

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

W> If you are used to `React.createClass()`, it is important to note that ES6 based class approach **doesn't** support autobinding behavior. See the end of this chapter for more information.

We also need to define that `Note` component:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>Learn webpack</div>;
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

If you hit `npm run build` now, you should get some output after a while. Here's a sample:

```bash
> TARGET=build webpack

Hash: a235591f70fee65ac6c6
Version: webpack 1.10.1
Time: 3718ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     653 kB       0  [emitted]  main
bundle.js.map     769 kB       0  [emitted]  main
   index.html  184 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

As you can see, the output is quite chunky!

## Optimizing Build Size

We can resolve this issue by minifying our build. An easy way to do this is to pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your webpack configuration:

**webpack.config.js**

```javascript
var webpack = require('webpack');

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    devtool: 'source-map',
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}
```

If you hit `npm run build` now, you should see better results:

```bash
> TARGET=build webpack

Hash: 98a618ef4d32c8627010
Version: webpack 1.10.1
Time: 6726ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     172 kB       0  [emitted]  main
bundle.js.map    1.57 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about but may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get in an optimized manner. This will disable some checks (i.e. property type checks) but it will give you a smaller build and improved performance.

In webpack terms you can add the following snippet to the `plugins` section of your configuration like this:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // This has effect on the react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      ...
    ]
  });
}
```

T> That `JSON.stringify` is needed as webpack will perform string replace "as is". In this case we'll want to end up with strings as that's what various comparisons expect, not just `production`. Latter would just cause an error.

Hit `npm run build` again and you should see improved results:

```bash
> TARGET=build webpack

Hash: aa14e0e6b73e3a30ad04
Version: webpack 1.10.1
Time: 6092ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     123 kB       0  [emitted]  main
bundle.js.map    1.48 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 158 hidden modules
```

So we went from 653k to 172k and finally to 123k. The final build is a little faster than the previous one. As that 123k can be served gzipped, it is very reasonable. As we add dependencies to the project the size will grow. Then we will have to apply some other strategies and be smarter about loading. Fortunately we can do all that with webpack when the time comes.

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
        loaders: ['style', 'css']
      }
    ]
  },
  ...
};

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel?stage=1',
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    },
    plugins: [
      ...
    ]
  });
}

if(TARGET === 'dev') {
  module.exports = merge(common, {
    ...
    entry: [
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

## React Component Styles

Besides ES6 classes React allows you to construct components using `React.createClass()`. That was the original way to create components and is still in use. The approaches aren't equivalent by default.

When you are using `React.createClass` it is possible to inject functionality to a component using mixins. This isn't possible in ES6 by default unless you are using a helper such as [react-mixin](https://github.com/brigand/react-mixin). In the next chapter we will go through various alternative approaches that allow you to reach roughly equivalent results as you can achieve with mixins. Often a decorator is all you need.

In addition ES6 class based components won't bind their methods to `this` context by default. This is the reason why it's a good practice to bind the context at component constructor. We will use this convention in this book. It leads to some extra code but later on it is likely possible to refactor it out.

The biggest benefit of the class based approach is that it decreases the amount of concepts you have to worry about. Particularly `constructor` helps to keep things simpler than in `React.createClass` based approach where you need to define separate methods to achieve the same result.

In the future property initializers (likely `tick = () => { ... }`) will solve this neatly. In fact the proposed feature is available through Babel's stage 0 but enabling that may lead to other problems later on in case the features change.

## Conclusion

You should understand how to set up React with webpack now. In the process we saw how to develop webpack configuration and learned a few new concepts. This is the way you work with webpack. You'll find loaders as you require them and integrate them to your project.

Now that we have a good development environment, we can focus on React development more fully. In the next chapter you will see how to implement a little Todo application. That will be improved in the subsequent chapters into a full blown Kanban table.
