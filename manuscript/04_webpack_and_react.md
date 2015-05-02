# Webpack and React

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

## What the React?

React isn't a framework like Angular.js or Ember. Instead it's just a library focusing on the view layer. It introduced a concept known as virtual DOM to web developers. This means that instead of manipulating DOM directly just like all the libraries and frameworks before it, React maintains a DOM of its own. As changed are made to virtual DOM, React will batch the changes to actual DOM as it sees best.

This has meant that the developers of React have decoupled themselves from the limitations of DOM. As a result React is highly performant although this comes with a cost. The library isn't as small as you might expect. You can expect bundle sizes for small applications to be around 150-200k, React included. That is considerably less when gzipped over wire but it's still something.

Even if React isn't the smallest library out there it does manage to solve some serious problems. It is a pleasure to develop with thanks to its relative simplicity and powerful API. You will need to complement with a set of tools but you can pick these based on actual need. It's far from a "one size fits all" type of solution which frameworks tend to be.

The approach used by React allowed Facebook to develop React Native on top of the same ideas. This time instead of DOM, we are operating on mobile platform rendering. React Native provides abstraction over components and layout system whereas providing you the setup you already know from the web. It can be seen as a gateway for web developers wanting to develop performant mobile applications.

Webpack and React work well together. By now we understand how to set up a simple project. We can extend it to work with React easily. Before we get to implement anything serious, it's a good idea to make sure we have a decent development environment. That will make everything so much easier.

## Installing React

To get started install React to your project. Just hit `npm i react --save` and you should be set. As a next step we could port our **app/component.js** to React. Provided we use ES6 module and class syntax and JSX, we can go with a solution like this:

**app/components/App.jsx**

```javascript
'use strict';
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
'use strict';
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
'use strict';
import './stylesheets/main.css';

import React from 'react';
import App from './components/App';

main();

function main() {
    React.render(<App />, document.getElementById('app'));
}
```

This change needs to be taken in count at configuration. Change entry path like this:

**config/index.js**

```javascript
{
  entry: [path.join(ROOT_PATH, 'app/main.jsx')]
  ...
}
```

W> Avoid rendering directly to `document.body`. This can cause strange problems with relying on it. Instead give React a little sandbox of its own.

## Setting Up Webpack

In order to make everything work again, we'll need to tweak our configuration a little. In order to deal with ES6 and JSX, we'll use [babel-loader](https://www.npmjs.com/package/babel-loader). Install it using `npm i babel-loader --save-dev`. In addition add the following loader declaration to the *loaders* section of your configuration:

**config/index.js**

```javascript
var common = {
  ...
  module: {
    loaders: [
      {
        // test for both js and jsx
        test: /\.jsx?$/,

        // use babel loader
        loader: 'babel',

        // operate only on our app directory
        include: path.join(ROOT_PATH, 'app'),
      },
      ...
    ]
  },
  ...
};
```

We will specifically include our `app` source to our loader. This way Webpack doesn't have to traverse whole source. Particularly going through `node_modules` can take a while. You can try taking `include` statement out to see how that affects the performance.

Webpack traverses `['', '.webpack.js', '.web.js', '.js']` files by default. This will get problematic with our `import Note from './Note';` statement. In order to make it find JSX, we'll need to add another piece of configuration like this:

**config/index.js**

```javascript
var common = {
  ...
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  ...
};
```

If you hit `npm run build` now, you should get some output after a while. Here's a sample:

```bash
> webpack --config config/build

Hash: 070e822e8cffd925a27c
Version: webpack 1.8.4
Time: 1858ms
    Asset    Size  Chunks             Chunk Names
bundle.js  645 kB       0  [emitted]  main
   [0] multi main 28 bytes {0} [built]
    + 162 hidden modules
```

As you can see, the output is quite chunky!

## Optimizing Build Size

We can resolve this issue by minifying our build. As easy way to do this is to pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your Webpack configuration:

**config/index.js**

```javascript
'use strict';
var webpack = require('webpack');

...

if(TARGET === 'build') {
  module.exports = mergeConfig({
    ...
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
> webpack --config config/build

Hash: 88ce689da36358669b22
Version: webpack 1.8.4
Time: 5240ms
    Asset    Size  Chunks             Chunk Names
bundle.js  170 kB       0  [emitted]  main
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get in an optimized manner. This will disable some checks (ie. property type checks) but it will give you a smaller build and improved performance.

In Webpack terms you can add the following snippet to the `plugins` section of your configuration like this:

**config/index.js**

```javascript
if(TARGET === 'build') {
  module.exports = mergeConfig({
    ...
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

Hit `npm run build` again and you should see improved results:

```bash
> webpack --config config/build

Hash: 9ced39bb13d4b29e5c7a
Version: webpack 1.8.4
Time: 4850ms
    Asset    Size  Chunks             Chunk Names
bundle.js  122 kB       0  [emitted]  main
   [0] multi main 28 bytes {0} [built]
    + 158 hidden modules
```

So we went from 645k to 170k and finally to 122k. The final build is a little faster than the previous one. As that 122k can be served gzipped, it is very reasonable. Things will get more problematic as we continue to add dependencies to our project. In that case we will have to apply some other strategies and be smarter about loading.

## Activating Hot Loading for Development

If you hit `npm run dev`, hit *localhost:8080* and try to modify our component (make it output `Learn React` or something), you'll see it actually works. After a flash. That's a little unfortunate especially if our application is more complex has state. It is annoying to manipulate the user interface back to the state in which it was in order to test something.

We can work around this problem using hot loading. This is enabled by [react-hot-loader](https://gaearon.github.io/react-hot-loader/). It will swap React components one by one as they change without forcing a full refresh. There will be times when that will be necessary but it will help a lot. Once you get used to hot loading, it is hard to live without.

To enable hot loading for React, you should perform `npm i react-hot-loader --save-dev` and tweak the configuration as follows:

**config/index.js**

```javascript
'use strict';
var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');

...

var common = {
  ...
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      }
    ]
  },
};

...

if(TARGET === 'build') {
  module.exports = mergeConfig({
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel',
          include: path.join(ROOT_PATH, 'app'),
        }
      ]
    },
    plugins: [
      ...
    ]
  });
}

if(TARGET === 'dev') {
  module.exports = mergeConfig({
    entry: ['webpack/hot/dev-server'],
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel'],
          include: path.join(ROOT_PATH, 'app'),
        }
      ]
    },
    plugins: [
      // do not reload if there is a syntax error in your code
      new webpack.NoErrorsPlugin()
    ],
  });
}
```

Try hitting `npm run dev` again and modifying the component. Note what doesn't happen this time. There's no flash! It might take a while to sink in but in practice this is a powerful feature. Small things such as this add up and make you more effective.

## Conclusion

You should understand how to set up React with Webpack now. In the process we saw how to develop Webpack configuration and learned a few new concepts. This is the way you work with Webpack. You'll find loaders as you require them and integrate them to your project.

Now that we have a good development environment, we can focus on React development more fully. In the next chapter you will see how to implement a little Todo application. That will be improved in the subsequent chapters into a full blown Kanban table.
