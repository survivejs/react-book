# Webpack and React

![React](images/react_header.png)

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

Webpack provides a good starting point for serious React development. React itself "solves" just the view portion of web development. It will take some getting used to but conceptually it is quite simple once you get your mind around it. Some practices, such as styling, are still under debate as we will see in later chapters.

T> Common editors (Sublime Text, vim, emacs, Atom etc.) have good support for React. Even IDEs such as [WebStorm](https://www.jetbrains.com/webstorm/) support it up to an extent. [Nuclide](http://nuclide.io/), an Atom based IDE, has been developed React in mind. Tooling might not support the newest language features always but overall the situation is good.

## What is React?

React isn't a framework like Angular.js or Ember. Instead it's just a library focusing on the view layer. It introduced a concept known as virtual DOM to web developers. This means that instead of manipulating DOM directly just like all the libraries and frameworks before it, React maintains a DOM of its own. As changes are made to virtual DOM, React will batch the changes to actual DOM as it sees best.

React provides a JavaScript API for generating this virtual DOM. Commonly React developers like to use format known as JSX. It looks a bit like HTML while using attribute names borrowed from JavaScript. We'll be using JSX in this format but it's not the only way to use React.

This has meant that the developers of React have decoupled themselves from the limitations of DOM. As a result React is highly performant. This comes with a cost. The library isn't as small as you might expect. You can expect bundle sizes for small applications to be around 150-200k, React included. That is considerably less when gzipped over wire but it's still something.

T> The interesting side benefit of this approach is that React doesn't depend on DOM. In fact React can use other targets, such as mobile or canvas. DOM just happens to be the most relevant one for web developers.

Even if React isn't the smallest library out there it does manage to solve serious problems. It is a pleasure to develop with thanks to its relative simplicity and powerful API. You will need to complement with a set of tools but you can pick these based on actual need. It's far from a "one size fits all" type of solution which frameworks tend to be.

The approach used by React allowed Facebook to develop React Native on top of the same ideas. This time instead of DOM, we are operating on mobile platform rendering. React Native provides abstraction over components and layout system while providing you the setup you already know from the web. It can be seen as a gateway for web developers wanting to develop performant mobile applications.

Webpack and React work well together. By now we understand how to set up a simple project. We can extend it to work with React easily. Before we get to implement anything serious, it's a good idea to make sure we have a decent development environment. That will make everything so much easier.

## Babel

![Babel](images/babel.png)

[Babel](https://babeljs.io/) is one of those projects that has made a big impact on the community. It allows us to use features from the future of JavaScript. It will transform your futuristic code to a format browsers understand. You can even use it to develop your own language features. Babel's built-in JSX support will come in handy here.

In addition to the standardized ES6 features Babel provides support for certain [experimental features](https://babeljs.io/docs/usage/experimental/) from ES7. Some of these might make it to the core language while some might be dropped altogether. The language proposals have been categorized within stages. Stage 0 is a strawman, stage 1 a proposal, stage 2 draft and so on.

I would be especially careful with stage 0 as if a stage 0 feature you are depending upon goes away you'll have to rewrite some of your code. But in smaller projects that may be worth the risk. Babel has stage 2 and higher features enabled by default. In our project we'll enable stage 1 to use decorators and property spreading as they will make our code a little tidier. You can find more information at [Babel documentation](https://babeljs.io/docs/usage/experimental/).

T> You can [try out Babel online](https://babeljs.io/repl/) to see what kind of code it generates.

### Configuring babel-loader

In order to set up Babel for our project we can use [babel-loader](https://www.npmjs.com/package/babel-loader). Install it using `npm i babel-core babel-loader --save-dev`. `babel-core` is a peer dependency of `babel-loader` so that needs to be installed explicitly to make the project work with npm 3.

In addition add the following loader declaration to the *loaders* section of your configuration. It will tell webpack to match against `.js` and `.jsx` (`/\.jsx?$/`) using a regular expression. In addition we pass `stage` argument for Babel so it knows we want to enable stage 1 features.

To keep everything performant we restrict the loader to operate within `./app` directory. This way it won't traverse `node_modules`. An alternatively would be to set up an `exclude` rule against `node_modules` explicitly but I find it more useful to `include` instead as that's more explicit. You never know what files might be in the structure after all.

Webpack traverses `['', '.webpack.js', '.web.js', '.js']` files by default. This will get problematic with our `import Note from './Note';` statement. In order to make it find JSX, we'll need to tweak webpack's `resolve.extensions` to include JSX.

Here's the relevant configuration we need to make Babel work:

**webpack.config.js**

```javascript
var common = {
  entry: [path.resolve(ROOT_PATH, 'app/main')],
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  ...
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel?stage=1',
        include: path.resolve(ROOT_PATH, 'app')
      },
      ...
    ]
  },
  ...
};
```

T> Another way to deal with Babel configuration would be to define a [.babelrc](https://babeljs.io/docs/usage/babelrc/) file in the project root. It would contain default settings used by Babel. It's the same idea as for ESLint and many other tools discussed later.

## Installing React

Hit `npm i react --save` at the project root to add React to our project. As a next step we can start developing our Kanban application. First we should define `App`. This will be the core of our application. It represents the high level view of it and works as an entry point. Later on it will orchestrate it all.

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

W> If you are used to `React.createClass()`, it is important to note that ES6 based class approach **doesn't** support autobinding behavior. Apart from that you may find ES6 classes neater. See the end of this chapter for more information.

We also need to define `Note` component. In this case we will just want to show some text like `Learn webpack`. `Hello world` would work if you are into clichés.

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>Learn webpack</div>;
  }
}
```

T> Note that we're using *jsx* extension here to tell modules using JSX syntax apart from regular ones. It is not absolutely necessary but it is a good convention to have.

In addition we'll need to adjust our `main.js` to render the component correctly. Note that I've renamed it as `main.jsx` given we have JSX content there. First the rendering logic creates a DOM element where to render and then it renders our application through React.

**app/main.jsx**

```javascript
import './stylesheets/main.css';

import React from 'react';
import App from './components/App';

main();

function main() {
  const app = document.createElement('div');

  document.body.appendChild(app);

  React.render(<App />, app);
}
```

I'll be using `const` whenever possible. It will give me a guarantee that the reference to the object won't get changed inadvertently. It does allow you to modify the object contents, though. I.e. you can still push new items to an array and so on.

If I want something mutable, I'll use `let` instead. `let` is scoped to the code block and is another new feature introduced with ES6. These both are good safety measures.

W> Avoid rendering directly to `document.body`. This can cause strange problems with relying on it. Instead give React a little sandbox of its own. That way everyone, including React, will stay happy.

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

As you can see, the output is quite chunky! Fortunately there are a few tricks we can do about that.

## Optimizing Build Size

There are two simple things we can perform to make our build slimmer. We can apply some minification to it. We can also tell React to optimize itself. Doing both will result in significant size savings. Provided we apply gzip compression on the content when serving it, further gains may be made.

### Minification

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Fortunately we don't have to care about exact technical details.

At minimum we need to just pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your webpack configuration:

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

### `process.env.NODE_ENV`

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

This is a useful technique for your own code. If you have a section of code that evaluates as `false` after this process, the minifier will remove it from build completely. You can attach debugging specific utilities and such to your code easily this way. For instance you could build a powerful logging system just for development. Here's a small example of what that could look like:

```javascript
if(process.env.NODE_ENV !== 'production') {
  console.log('developing like an ace');
}
```

T> That `JSON.stringify` is needed as webpack will perform string replace "as is". In this case we'll want to end up with strings as that's what various comparisons expect, not just `production`. Latter would just cause an error. An alternative would be to use a string such as `'"production"'`. Note the "'s.

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

To enable hot loading for React, you should perform `npm i react-hot-loader --save-dev`. Besides this we'll need to split our JSX configuration. Our old configuration is good enough for production build. We'll need to enable hot loading for development explicitly. I've split this up in the configuration below so you can see how this works.

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

When you are using `React.createClass` it is possible to inject functionality to a component using mixins. This isn't possible in ES6 by default unless you are using a helper such as [react-mixin](https://github.com/brigand/react-mixin). In later chapters we will go through various alternative approaches that allow you to reach roughly equivalent results as you can achieve with mixins. Often a decorator is all you need.

In addition ES6 class based components won't bind their methods to `this` context by default. This is the reason why it's a good practice to bind the context at component constructor. We will use this convention in this book. It leads to some extra code but later on it is likely possible to refactor it out.

The biggest benefit of the class based approach is that it decreases the amount of concepts you have to worry about. Particularly `constructor` helps to keep things simpler than in `React.createClass` based approach where you need to define separate methods to achieve the same result.

In the future property initializers (likely `tick = () => { ... }`) will solve this neatly. In fact the proposed feature is available through Babel's stage 0 but enabling that may lead to other problems later on in case the features change.

## Conclusion

You should understand how to set up React with webpack now. In the process we saw how to develop webpack configuration and learned a few new concepts. This is the way you work with webpack. You'll find loaders as you require them and integrate them to your project.

Now that we have a good development environment, we can focus on React development. In the next chapter you will see how to implement a little Note taking application. That will be improved in the subsequent chapters into a full blown Kanban table.
