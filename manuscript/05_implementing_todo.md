## Implementing a Basic Todo List

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
  displayName: 'TodoApp'

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
  displayName: 'TodoItem'

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

TBD
