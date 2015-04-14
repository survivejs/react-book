# Webpack and React

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

Webpack is an ideal tool to complement it. By now we understand how to set up a simple project on top of Webpack. Let's turn it into a React project next and implement a little todo app. It won't be very complex but will help you to understand some of the basics.

## Installing React

To get started install React to your project. Just hit `npm i react --save` and you should be set. As a next step we could port our **app/component.js** to React. Provided we use ES6 module and class syntax and JSX, we can go with a solution like this:

**app/App.jsx**

```javascript
import React from 'react';
import TodoItem from './TodoItem';

export default class App extends React.Component {
  render() {
    return <TodoItem />;
  }
}
```

`App` will work as an entry point to our application. Later on it will orchestrate logic etc.

**app/TodoItem.jsx**

```javascript
import React from 'react';

export default class TodoItem extends React.Component {
  render() {
    return <div>Learn Webpack</div>;
  }
}
```

> Note that we're using *jsx* extension here to tell modules using JSX syntax apart from regular ones. This is a good convention to have.

In addition we'll need to adjust our `main.js` to render the component correctly. Note that I've renamed it as `main.jsx` given we have JSX content there. Here's one solution:

**app/main.jsx**

```javascript
import './main.css';

import React from 'react';
import App from './App';

main();

function main() {
    React.render(<App />, document.getElementById('app'));
}
```

This change needs to be taken in count at configuration. Change entry path like this:

```javascript
{
  entry: [path.join(ROOT_PATH, 'app/main.jsx')]
  ...
}
```

> Avoid rendering directly to `document.body`. This can cause strange problems with relying on it. Instead give React a little sandbox of its own.

## Setting Up Webpack

In order to make everything work again, we'll need to tweak our configuration a little. In order to deal with ES6 and JSX, we'll use [babel-loader](https://www.npmjs.com/package/babel-loader). Install it using `npm i babel-loader --save-dev`. In addition add the following loader declaration to the *loaders* section of your configuration:

```javascript
{
  // test for both js and jsx
  test: /\.jsx?$/,

  // use babel loader
  loader: 'babel',

  // operate only on our app directory
  include: path.join(ROOT_PATH, 'app'),
}
```

We will specifically include our `app` source to our loader. This way Webpack doesn't have to traverse whole source. Particularly going through `node_modules` can take a while. You can try taking `include` statement out to see how that affects the performance.

Webpack traverses `['', '.webpack.js', '.web.js', '.js']` files by default. This will get problematic with our `import TodoItem from './TodoItem';` statement. In order to make it find JSX, we'll need to add another piece of configuration like this:

```javascript
resolve: {
  extensions: ['', '.js', '.jsx'],
}
```

If you hit `npm run build` now, you should get some output after a while. Here's a sample:

```bash
> webpack_demo@1.0.0 build /Users/something/projects/webpack_demo
> webpack --config config/build

Hash: 070e822e8cffd925a27c
Version: webpack 1.8.4
Time: 1858ms
    Asset    Size  Chunks             Chunk Names
bundle.js  645 kB       0  [emitted]  main
   [0] multi main 28 bytes {0} [built]
    + 162 hidden modules
```

As you can see, the output is quite chunky in this case! Don't worry. This is just an unoptimized build. We can do a lot about the size at a later stage when we apply optimizations, minification and split things up.

## Activating Hot Loading for Development

If you hit `npm run dev`, hit *localhost:8080* and try to modify our component (make it output `Learn React` or something), you'll see it actually works. After a flash. We can get something fancier with Webpack, namely hot loading. This is enabled by [react-hot-loader](https://gaearon.github.io/react-hot-loader/).

To make this work, you should `npm i react-hot-loader --save-dev` and tweak the configuration as follows:

**config/index.js**

```javascript
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

exports.build = mergeConfig({
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.join(ROOT_PATH, 'app'),
      }
    ]
  }
});

exports.develop = mergeConfig({
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
```

Try hitting `npm run dev` again and modifying the component. Note what doesn't happen this time. There's no flash! What did we just do?

*react-hot-loader* swaps component with a new version if it detects the component has changed. This process retains application state. Even though this might feel like a small thing in practice it's bigger as you don't need to manipulate the whole application to the same state just in order to test something.

There will be times when you will need to force refresh but this eliminates a lot of manual refresh work required and allows you to focus more on development. It is one of those little things but it adds up as we will see.

## Setting Up ESLint

A little discipline goes a long way in programming. Linting is one of those techniques that will simplify your life a lot at a minimal cost. You can fix potential problems before they escalate into actual issues. It won't replace testing but will definitely help. It is possible to integrate this process into your editor/IDE.

[ESLint](http://eslint.org/) is a recent linting solution for JavaScript. It builds on top of ideas presented by JSLint and JSHint. Most importantly it allows you to develop custom rules. As a result a nice set of rules have been developed for React in form of [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react).

In order to integrate ESLint with our project, we'll need to do a couple of little tweaks. To get it installed, invoke `npm i babel-eslint eslint eslint-plugin-react --save-dev`. That will add ESLint and the plugin we want to use as our project development dependency.

Next we'll need to do some configuration. Add `"lint": "eslint . --ext .js --ext .jsx"` to the *scripts* section of **package.json**. This will run ESLint on our all JS and JSX files of our project. That's definitely too much so we'll need to restrict it. Set up *.eslintignore* to the project root like this:

**.eslintignore**

```bash
node_modules/
build/
```

Next we'll need to activate [babel-eslint](https://www.npmjs.com/package/babel-eslint) so that ESLint works with our Babel code. In addition we need to activate React specific rules and set up a couple of our own. You can adjust these to your liking. You'll find more information about the rules at [the official rule documentation](http://eslint.org/docs/rules/).

**.eslintrc**

```json
{
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": [
    "react"
  ],
  "ecmaFeatures": {
    "jsx": true,
    "globalReturn": false
  },
  "rules": {
    "no-unused-vars": false,
    "no-underscore-dangle": false,
    "no-use-before-define": false,
    "quotes": [2, "single"],
    "comma-dangle": "always",
    "react/display-name": true,
    "react/jsx-boolean-value": true,
    "react/jsx-quotes": true,
    "react/jsx-no-undef": true,
    "react/jsx-sort-props": true,
    "react/jsx-uses-react": true,
    "react/jsx-uses-vars": true,
    "react/no-did-mount-set-state": true,
    "react/no-did-update-set-state": true,
    "react/no-multi-comp": true,
    "react/no-unknown-property": true,
    "react/prop-types": true,
    "react/react-in-jsx-scope": true,
    "react/self-closing-comp": true,
    "react/wrap-multilines": true
  }
}
```

> XXX: `"no-unused-vars": false` should be removed but looks like there might be some bug in babel-eslint/eslint-plugin-react preventing that to work correctly. Need to get back at this.

If you hit `npm run lint` now, you should get some errors and warnings to fix depending on the rules you have set up. Go ahead and fix them. You can check [the book site](https://github.com/survivejs/webpack) for potential fixes if you get stuck.

We can make Webpack emit ESLint messages for us by using [eslint-loader](https://www.npmjs.com/package/eslint-loader). Hit `npm i eslint-loader --save-dev` to add it to the project. We also need to tweak our development configuration to include it. Add the following section to it:

**config/index.js**

```
preLoaders: [
  {
    test: /\.jsx?$/,
    loader: 'eslint',
    include: path.join(ROOT_PATH, 'app'),
  }
],
```

We are using `preLoaders` section here as we want to play it safe. This section is executed before `loaders` get triggered.

If you execute `npm run dev` now and break some linting rule while developing, you should see that in terminal output.

## Conclusion

You should understand how to set up React with Webpack now. In the process we saw how to develop Webpack configuration and learned a few new concepts. This is the way you work with Webpack. You'll find loaders as you require them and integrate them to your project.

Now that we have a good development environment, we can focus on React development more fully. In the next chapter you will see how to implement a little Todo application. That will be improved in the subsequent chapters into a full blown Kanban table.
