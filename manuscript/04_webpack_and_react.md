# Webpack and React

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

Webpack is an ideal tool to complement it. By now we understand how to set up a simple project on top of Webpack. Let's turn it into a React project next and implement a little todo app. It won't be very complex but will help you to understand some of the basics.

## Installing React

To get started install React to your project. Just hit `npm i react --save` and you should be set. As a next step we could port our **app/component.js** to React. Provided we use ES6 module and class syntax and JSX, we can go with a solution like this:

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

In addition we'll need to adjust our `main.js` to render the component correctly. Here's one solution:

**app/main.js**

```javascript
import './main.css';

import React from 'react';
import TodoItem from './TodoItem';

React.render(<TodoItem />, document.getElementById('app'));

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

A little discipline goes a long way in programming. Linting is one of those techniques that will simplify your life a lot at a minimal cost. It is possible to integrate this process into your editor/IDE.

That way you can fix potential problems before they become actual issues. It won't replace testing but it will simplify your life and make it more boring. Boring is good.

[ESLint](http://eslint.org/) is a recent linting solution for JavaScript. It builds on top of ideas presented by JSLint and JSHint. Most importantly it allows you to develop custom rules. As a result a nice set of rules have been developed for React in form of [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react).

Setting it up is quite simple. We'll just need to a couple of little tweaks to our project. To get eslint installed, invoke `npm i babel-eslint eslint eslint-plugin-react --save-dev`. That will add ESLint and the plugin we want to use as our project development dependency.

Next we'll need to do some configuration. Add `"lint": "eslint . --ext .js --ext .jsx"` to the *scripts* section of **package.json**. Besides this we'll need to set up some ESlint specific configuration.

First we'll ignore `node_modules/` since we don't want to lint that. You should ignore possible distribution build and so on in this file.

**.eslintignore**

```
node_modules/
build/
```

Next we'll activate [babel-eslint](https://www.npmjs.com/package/babel-eslint) so that ESLint works with our Babel code. In addition we activate React specific rules and set up a couple of our own. You can adjust these to your liking. You'll find more information about the rules at [the official rule documentation](http://eslint.org/docs/rules/).

**.eslintrc**

```
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
    "no-underscore-dangle": false,
    "no-use-before-define": false,
    "quotes": [2, "single"],
    "comma-dangle": "always",
    "react/display-name": true,
    "react/jsx-quotes": true,
    "react/jsx-no-undef": true,
    "react/jsx-uses-react": true,
    "react/jsx-uses-vars": true,
    "react/no-did-mount-set-state": true,
    "react/no-did-update-set-state": true,
    "react/no-multi-comp": true,
    "react/prop-types": true,
    "react/react-in-jsx-scope": true,
    "react/self-closing-comp": true,
    "react/wrap-multilines": true
  }
}
```

If you hit `npm run lint` now, you should get some errors and warnings to fix depending on the rules you have set up.

There is a good ESLint integration available for many IDEs and editors already. You should consider setting it up for yours as that will allow you to spot possible issues as you develop.

In case you want Webpack to emit ESLint messages, you can set up [eslint-loader](https://www.npmjs.com/package/eslint-loader) for this purpose. You can even make your build fail on purpose if it doesn't pass the lint.

## Implementing Basic Todo List

Given we have a nice development setup now, we can actually get some work done. Hit `npm run dev`. It's time to start developing.

To make it easier, let's set up `TodoApp.jsx` that coordinates application itself. This will get rendered by `main.js` and will deal with the application logic. You should end up with files like this:

**app/main.js**

```javascript
import './main.css'

import React from 'react';
import TodoApp from './TodoApp';

React.render(<TodoApp />, document.getElementById('app'));
```

**app/TodoApp.jsx**

```javascript
'use strict';
import React from 'react';
import TodoItem from './TodoItem';

export default class TodoApp extends React.Component {
  render() {
    return <TodoItem />;
  }
}
```

**app/TodoItem.jsx**

```javascript
'use strict';
import React from 'react';

export default class TodoItem extends React.Component {
  render() {
    return <div>Learn Webpack</div>;
  }
}
```

Note that as you perform the needed modifications, your browser should get updated. You might see some error every now and then but that is to be expected given we are doing breaking changes here.

A good next step would be to extend `TodoItem` interface. We would probably want to render a list of these. Ideally we should be able to perform basic editing operations over the list and create new items as needed. We'll probably also want to mark items as done.

This means `TodoApp` will have to coordinate the state. Let's start by rendering a list and then expand from there. Here's sample code for an enhanced `render` method:

```javascript
render() {
  var todos = [{
    task: 'Learn Webpack'
  }, {
    task: 'Learn React'
  }, {
    task: 'Do laundry'
  }];

  return (
    <div>
      <ul>{todos.map((todo, i) =>
        <li key={'todo' + i}>
          <TodoItem task={todo.task} />
        </li>
      )}</ul>
    </div>
  );
}
```

To make it easy to grow the code, we treat possible todo items as a list of objects. We then map through them and generate `TodoItem` for each. During the process we set `key` for each list item. This is property React requires in order to render each item to correct place during each render pass. React will warn you if you forget to set it. In addition we pass the task in question to our `TodoItem` as a property.

If everything went correctly, you should see a list with three `Learn Webpack` items on it. That's almost nice. To make `TodoItem` render its property correctly, we'll need to tweak its implementation a little bit like this:

```javascript
render() {
  return <div>{this.props.task}</div>;
}
```

As you can see the property we passed to our component gets mapped to `this.props`. After that it is just a matter of showing it.

We haven't achieved much yet but we're getting there. Next we should add some logic to the list so this application can do something useful.

## Adding New Items to Todo List

It would be useful if we could add new items to our Todo list. Let's just do a button with plus that when triggered adds a new dummy item to our list.

To get a button show up, add

```html
<button onClick={this.addItem.bind(this)}>+</button>`
```

somewhere within `TodoApp` JSX. Besides this we'll need to define that `onClick` handler. Define a method like this:

```javascript
addItem() {
  console.log('add item');
}
```

Now when you click the button, you should see something at your browser console.

Next we will need to connect this with our data model somehow. It is problematic that now it is stored within our `render` method. React provides a concept known as state for this purpose. We can move our data there like this:

```javascript
constructor(props) {
  super(props);

  this.state = {
    todos: [{
      task: 'Learn Webpack'
    }, {
      task: 'Learn React'
    }, {
      task: 'Do laundry'
    }]
  };
}
render() {
  var todos = this.state.todos;

...
```

Now our `render` method points at `state`. As a result we can implement `addItem` that actually does something useful:

```javascript
addItem() {
  this.setState({
    todos: this.state.todos.concat([{
      task: 'New task'
    }])
  });
}
```

If you hit the button now, you should see new items. It might not be pretty yet but it works.

## Editing Todo List Items

Our Todo list is almost useful now. It is a little unfortunate that even though we can add new items to the list, we cannot modify them. It is time to implement edit.

A natural way to do this would be to allow the user to click an item. When an item is clicked, it would be replaced with an input control that would allow you to edit. After confirmed, the modification should remain there.

This means we'll need to extend `TodoItem` somehow and communicate possible changes to `TodoApp` so that it knows to update data model. `TodoItem` logic seems simple enough so it's a good idea to start with that. In addition `TodoItem` needs to keep track of its edit state and show the correct element based on that. Finally it will need to be able to communicate a state change. We can achieve that using a callback. `TodoApp` can then react to that (pun intended). Here's a sample implementation of the idea:

```javascript
export default class TodoItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edited: false
    };
  }
  render() {
    var edited = this.state.edited;
    var task = this.props.task;

    return <div>{
      edited
      ? <input type='text'
        defaultValue={task}
        onBlur={this.finishEdit.bind(this)}
        onKeyPress={this.checkEnter.bind(this)}/>
      : <div onClick={this.edit.bind(this)}>{task}</div>
    }</div>;
  }
  edit() {
    this.setState({
        edited: true
    });
  }
  checkEnter(e) {
    if(e.key === 'Enter') {
      this.finishEdit(e);
    }
  }
  finishEdit(e) {
    this.props.onEdit(e.target.value);

    this.setState({
      edited: false
    });
  }
}
```

It is quite a bit of code. First we need to stash the edit state within the component itself. Then we need to take that in count when rendering. We use a simple ternary expression for this purpose. The rest is about event handling and logic. After editing has finished, we'll trigger a callback bound to `onEdit` property. This will fail until we take this in count at `TodoApp`. The following code achieves this:

```javascript
render() {
  ...
  <TodoItem
    task={todoItem.task}
    onEdit={this.itemEdited.bind(this, i)} />
  ...
}
itemEdited(i, task) {
  var todos = this.state.todos;

  todos[i].task = task;

  this.setState({
    todos: todos
  });
}
```

Again, it's a matter of manipulating component state. After this change we can edit our items.

## Removing Todo List Items

We are still missing one vital functionality. It would be nice to be able to remove items. We can achieve this easily by extending edit. In case we empty a task, it would make sense to remove it. You can give it a go yourself or follow the example below. It is just a matter of modifying state.

```javascript
itemEdited(i, task) {
  var todos = this.state.todos;

  if(task) {
    todos[i].task = task;
  }
  else {
    todos = todos.slice(0, i).concat(todos.slice(i + 1));
  }

  this.setState({
    todos: todos
  });
}
```

This might not be the prettiest solution usability wise but it shows how far you can go with simple ideas. You could try to push removing to some separate control (ie. `x` per item). In that case you would probably set up a callback and then react to that and so on.

The approach we discussed works up to a point. Once you get more complicated component hierarchies it starts to fall apart. This is where architecture styles such as Flux and Relay come in.

## Adding Type Checking with Flow

As we saw earlier with `onEdit`, it gave us a nasty error before we actually defined a handler for the case. Thanks to [Flow](http://flowtype.org/) and [Flowcheck](https://gcanti.github.io/flowcheck/) we can add typing information to our source. This is very useful in a situation where you are working with large project and many developers. Just like with linting earlier this is one way to make your work more boring. Boring is still good!

We can set up Flow type checking to our Webpack easily by first doing `npm i flowcheck-loader --save-dev` and then extending our development configuration a little like this:

```javascript
{
  test: /\.jsx?$/,
  loaders: ['react-hot', 'babel', 'flowcheck'],
  include: path.join(ROOT_PATH, 'app'),
},
```

Now we can start typing. For instance you could attach types for `TodoItem` props like this:

```javascript
constructor(props: {
  task: string;
  onEdit: Function;
}) {
```

With Flow you can type the most vital parts of your source. You can think it as an executable form of documentation that helps you during development. As with linting it won't replace tests but it will make it easier to work with the source. See [Try Flow](https://tryflow.org/) for more concrete examples.

## Conclusion

In this chapter we set up a simple React project based on Webpack. In the process we implemented a stub for a Todo application. At the moment the architecture is a little messy. We'll resolve this problem in the next chapter as we introduce Flux.
