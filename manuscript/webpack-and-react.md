# Webpack and React

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

Webpack is an ideal tool to complement it. By now we understand how to set up a simple project on top of Webpack. Let's turn it into a React project next and implement a little todo app. It won't be very complex but will help you to understand some of the basics.

## Installing React

To get started install React to your project. Just hit `npm i react --save` and you should be set. As a next step we could port our **app/component.js** to React. Provided we use ES6 module and class syntax and JSX, we can go with a solution like this:

**app/TodoItem.js**

```javascript
import React from 'react';

export default class TodoItem extends React.Component {
    render() {
        return <div>Learn Webpack</div>;
    }
}
```

In addition we'll need to adjust our `main.js` to render the component correctly. Here's one solution:

**app/main.js**

```javascript
import React from 'react';
import Hello from './TodoItem';

React.render(<TodoItem />, document.getElementById('app'));
```

> Avoid rendering directly to `document.body`. This can cause strange problems with plugins that rely on body due to the way React works. It is much better idea to give it a container of its own.

## Setting Up Webpack

In order to make everything work again, we'll need to tweak our configuration a little. In order to deal with ES6 and JSX, we'll use [babel-loader](https://www.npmjs.com/package/babel-loader). Install it using `npm i babel-loader --save-dev`. In addition add the following loader declaration to the *loaders* section of your configuration:

```javascript
{
    test: /\.js$/,
    loader: 'babel',
    include: path.join(ROOT_PATH, 'app'),
}
```

We will specifically include our `app` source to our loader. This way Webpack doesn't have to traverse whole source. Particularly going through `node_modules` can take a while. You can try taking `include` statement out to see how that affects the performance.

> An alternative would be to `exclude` but `include` feels like a better solution here.

If you hit `npm run build` now, you should get some output after a while. Here's a sample:

```bash
> webpack_demo@1.0.0 build /Users/something/projects/webpack_demo
> webpack --config config/build

Hash: 00f0b93cf085fc55d4ec
Version: webpack 1.7.3
Time: 1149ms
    Asset    Size  Chunks             Chunk Names
bundle.js  633 kB       0  [emitted]  main
   [0] multi main 28 bytes {0} [built]
    + 162 hidden modules
```

As you can see, the output is quite chunky in this case! Don't worry. This is just an unoptimized build. We can do a lot about the size at a later stage when we apply optimizations, minification and split things up.

## Resolving JSX Files

The configuration above works but what if we want to resolve files with `.jsx` extension? After all it can be a good idea to separate vanilla JavaScript files from those containing JSX.

To achieve this we need to extend out Regex pattern like this:

```javascript
{
    test: /\.jsx?$/,
    loader: 'babel',
    include: path.join(ROOT_PATH, 'app'),
}
```

If you try renaming **app/component.js** as **app/component.jsx** and hit `npm run build`, you should get an error like this:

```bash
ERROR in ./app/main.js
Module not found: Error: Cannot resolve 'file' or 'directory' ./component in /Users/something/projects/webpack_demo/app
 @ ./app/main.js 11:13-35
```

This means Webpack cannot resolve our `import Hello from './component';` to a file.

The problem has to do with Webpack's default resolution settings. Those settings describe where Webpack looks for modules and how. We'll need to tweak these settings a little.

Add the following bit to your configuration:

```javascript
var common = {
    ...
    resolve: {
        extensions: ['', '.js', '.jsx', '.css'],
    }
};
```

Now Webpack will be able to resolve files ending with `.jsx` and everything should be fine. If you try running `npm run build` again, the build should succeed.

## Activating Hot Loading for Development

If you hit `npm run dev` and try to modify our component (make it output `hello world again` or something), you'll see it actually works. After a flash. We can get something fancier with Webpack, namely hot loading. This is enabled by [react-hot-loader](https://gaearon.github.io/react-hot-loader/).

To make this work, you should `npm i react-hot-loader --save-dev` and tweak the configuration as follows:

**config/index.js**

```javascript
var path = require('path');
var webpack = require('webpack');

...

exports.build = _.merge({
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                include: path.join(ROOT_PATH, 'app'),
            },
        ]
    },
}, common, joinArrays);

exports.develop = _.merge({
    entry: ['webpack/hot/dev-server'],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['react-hot', 'babel'],
                include: path.join(ROOT_PATH, 'app'),
            },
        ]
    },
    plugins: [
        // hot module replacement plugin itself. if you pass `--hot` to
        // webpack-dev-server, do not activate this!
        new webpack.HotModuleReplacementPlugin(),
        // do not reload if there is a syntax error in your code
        new webpack.NoErrorsPlugin()
    ],
}, common, joinArrays);
```

Note what happens if you `npm run dev` now and try to modify the component. There should be no flash (no refresh) while the component should get updated provided there was no syntax error.

The advantage of this approach is that the user interface retains its state. This can be quite convenient! There will be times when you may need to force a refresh but this tooling decreases the need for that significantly.

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
    "quotes": [4, "single"],
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

## Porting to Alt, a Flux Implementation

To give you an idea how to scale up from our Todo example, we can port it to use an implementation of Flux. In this case we will be using [Alt](https://github.com/goatslacker/alt). It is a light implementation that provides just enough functionality for our purposes.

As we have seen so far React is all about dealing with views. Flux provides more bits to the equation. It provides us means to define Stores for our data and Actions that can manipulate be used to manipulate it. We will trigger Actions from our components. Components will also consume the data provided by Stores. As a result we have a unidirectional loop, a sort of Ouroboros, infinite waterfall or whatever you like to call it.

Before delving into the implementation itself, `npm i alt --save` to get the dependency we need. Next we could think about Actions we need to perform on our data. We'll need to be able to `createTodo`, `updateTodo` and `removeTodo` at least. In terms of Alt it would look like this:

**app/TodoActions.js**

```javascript
import alt from './alt';

class TodoActions {
    createTodo(task) {
        this.dispatch(task);
    }
    updateTodo(id, task) {
        this.dispatch({id, task});
    }
    removeTodo(id) {
        this.dispatch(id);
    }
}

export default alt.createActions(TodoActions);
```

Next we will need to define a store that maintains the data based on these actions:

**app/TodoStore.js**

```javascript
import alt from './alt';
import TodoActions from './TodoActions';

class TodoStore {
    constructor() {
        this.bindListeners({
            createTodo: TodoActions.createTodo,
            updateTodo: TodoActions.updateTodo,
            removeTodo: TodoActions.removeTodo
        });

        this.todos = [];
    }
    createTodo(task) {
        this.setState({
            todos: this.todos.concat([{
                task: task
            }])
        });
    }
    updateTodo({id, task}) {
        const todos = this.todos;

        todos[id].task = task;

        this.setState({todos});
    }
    removeTodo(id) {
        const todos = this.todos;

        this.setState({
            todos: todos.slice(0, id).concat(todos.slice(id + 1))
        });
    }
}

export default alt.createStore(TodoStore, 'TodoStore');
```

The functions have been adapted based on our earlier implementation of `TodoApp`.

We will also need a module to maintain an instance of Alt:

**app/alt.js**

```javascript
import Alt from 'alt';
export default new Alt();
```

Finally we'll need to tweak our `TodoApp` to operate based on `TodoStore` and `TodoActions`:

**app/TodoApp.jsx**

```javascript
'use strict';
import React from 'react';
import TodoItem from './TodoItem';
import TodoActions from './TodoActions';
import TodoStore from './TodoStore';

export default class TodoApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = TodoStore.getState();
    }
    componentDidMount() {
        TodoStore.listen(this.storeChanged.bind(this));
    }
    componentWillUnmount() {
        TodoStore.unlisten(this.storeChanged.bind(this));
    }
    storeChanged() {
        this.setState(TodoStore.getState());
    }
    render() {
        var todos = this.state.todos;

        return (
            <div>
                <ul>{todos.map((todo, i) =>
                    <li key={'todo' + i}>
                        <TodoItem
                            task={todo.task}
                            onEdit={this.itemEdited.bind(this, i)} />
                    </li>
                )}</ul>

                <button onClick={this.addItem.bind(this)}>+</button>
            </div>
        );
    }
    addItem() {
        TodoActions.createTodo('New task');
    }
    itemEdited(id, task) {
        if(task) {
            TodoActions.updateTodo(id, task);
        }
        else {
            TodoActions.removeTodo(id);
        }
    }
}
```

As you can see, we pushed the logic out of our application. We actually have more code now than before. Fortunately it was not all in vain. Consider the following questions:

1. Let's say we wanted to persist the Todos within `localStorage`, where would you implement that? It would be natural to plug that into our `TodoStore`.
2. What if we had multiple components relying on the data? We would just consume `TodoStore` and display it however we want.
3. What if we had multiple, separate Todo lists for different type of tasks? We would set up multiple instances of `TodoStore`. If we wanted to move items between lists, we would already have ready-made Actions for that purpose.

This is what makes Flux a strong architecture when used with React. It isn't hard to find answers to questions like these. Even though there is more code it is easier to reason about. Given we are dealing with unidirectional flow we have something that is simple to debug and test.

Flux does have its problems, however. That is where Relay comes in. It is an approach that allows you to define data needs on component level. The gotcha here is that it relies on GraphQL language. At the time of writing there isn't an open source solution available yet. No doubt Relay will be able to take the approach showcased by Flux even further.

## Conclusion

TODO
