# Implementing a Basic Todo List

Given we have a nice development setup now, we can actually get some work done. Our goal here is to end up with a crude Todo List with basic manipulation operations. Hit `npm run dev`. It's time to start developing.

## Setting up an App Container

To make it easier, let's set up `TodoApp.jsx` that coordinates application itself. This will get rendered by `main.jsx` and will deal with the application logic. You should end up with files like this:

**app/main.jsx**

```javascript
'use strict';
import './main.css';

import React from 'react';
import TodoApp from './TodoApp';

main();

function main() {
    React.render(<TodoApp />, document.getElementById('app'));
}
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

## Extending TodoItem

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

We will use a special feature of JSX in form of `{}`. Within these braces we can mix JavaScript with JSX. In this case we will render a bunch of `li` elements. Each contains a `TodoItem`. In order to tell React in which order to render the elements, we'll set `key` property for each. It is important that this is unique or otherwise it won't be able to figure out the correct order.

If everything went correctly, you should see a list with three `Learn Webpack` items on it. That's almost nice. The problem is that we haven't taken `task` property in count at `TodoItem`. We'll need to tweak its implementation like this:

```javascript
render() {
  return <div>{this.props.task}</div>;
}
```

As you can see the property we passed to our component gets mapped to `this.props`. After that it is just a matter of showing it wherever we like.

We haven't achieved much yet but we're getting there. Next we should add some logic to the list so this application can do something useful.

## Adding New Items to Todo List

It would be useful if we could add new items to our Todo list. Let's just do a button with plus that when triggered adds a new dummy item to our list.

To get a button show up, add

```html
<button onClick={this.addItem.bind(this)}>+</button>
```

in the beginning of `TodoApp` JSX. Besides this we'll need to define that `onClick` handler. Define a method like this:

```javascript
addItem() {
  console.log('add item');
}
```

Now when you click the button, you should see something at your browser console.

## Connecting `addItem` with Data Model

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

This means we'll need to extend `TodoItem` somehow and communicate possible changes to `TodoApp` so that it knows to update data model. In addition `TodoItem` needs to keep track of its edit state and show the correct element (div or input) based on that.

We can achieve these goals using a callback and a ternary expression. Here's a sample implementation of the idea:

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

It's a lot of code to digest. `TodoItem` has *edited* state to keep track of. We will manipulate that to change the way it is rendered. If we hit **edit**, we'll trigger edit mode. Once input receives either *blur* event or Enter key, we'll finish editing and reset the value. When finishing we also trigger a callback so the app knows to react.

In order to make that happen we'll need to define that callback for `TodoApp` like this:

```javascript
render() {
  ...
  <TodoItem
    task={todo.task}
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

We are still missing one vital functionality. It would be nice to be able to remove items. We can achieve this easily by extending edit.

In case we empty a task, it would make sense to remove it. You can give it a go yourself or follow the example below. It is just a matter of modifying state.

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

An alternative way would have been to render some sort of button for removing an item. When pressed it would have triggered similar logic. If you feel like it, give it a go. Just have something like `<button onClick={this.removeItem.bind(null, i)}>-</button>` there, delete based on index and update state.

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

The approach we discussed works up to a point. Once you get more complicated component hierarchies it starts to fall apart. This is where architecture styles such as Flux and Relay come in. In the next chapter we will discuss Flux in particular and port our application to use it.
