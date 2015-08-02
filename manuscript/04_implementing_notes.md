# Implementing a Basic Note Application

Given we have a nice development setup now, we can actually get some work done. Our goal here is to end up with a crude note taking application with basic manipulation operations. We will start by doing things the hard way. We will grow our application from scratch and get into some trouble. After that you should understand better why architecture models such as Flux are needed.

## Initial Data Model

Often a good way to begin designing application is to start with the data. We could model a list of notes as follows:

```javascript
[
  {
    id: '4a068c42-75b2-4ae2-bd0d-284b4abbb8f0',
    task: 'Learn webpack'
  },
  {
    id: '4e81fc6e-bfb6-419b-93e5-0242fb6f3f6a',
    task: 'Learn React'
  },
  {
    id: '11bbffc8-5891-4b45-b9ea-5c99aadf870f',
    task: 'Do laundry'
  }
];
```

Each note is an object which will contain the data we need including `id` and `task` we want to perform. Later on it is possible to extend this data definition to include things like note color or owner.

## On Ids

You probably noticed those ids at the definition above. Ids will become valuable as we grow the project. A naive way to deal with them is to rely on array indexing. That becomes troublesome quite soon, though. For instance if you are referring to data based on array indices and the data changes, each reference has to change too. That is somewhat undesirable.

Instead it can be valuable to use a proper indexing scheme here. Normally this is solved by a backend. As we don't have one yet, we'll need to improvise something. A standard known as [RFC4122](https://www.ietf.org/rfc/rfc4122.txt) describes a good way to do this. We'll be using Node.js implementation of it.

Invoke

> npm i node-uuid --save

at the project root to get it installed. If you open up Node.js cli (`node`) and try the following, you can see what kind of ids it outputs.

```javascript
> uuid = require('node-uuid')
{ [Function: v4]
  v1: [Function: v1],
  v4: [Circular],
  parse: [Function: parse],
  unparse: [Function: unparse],
  BufferClass: [Function: Array] }
> uuid.v4()
'1c8e7a12-0b4c-4f23-938c-00d7161f94fc'
```

`uuid.v4()` will help us to generate the ids we need for the purposes of this project.

T> If you are interested in the math behind this, check out [the calculations at Wikipedia](https://en.wikipedia.org/wiki/Universally_unique_identifier#Random_UUID_probability_of_duplicates) for details. You'll see that the possibility for collisions is somewhat miniscule.

## Connecting Data with `App`

The next step is connecting this data model with our `App`. As it will be quite a bit of code I've included whole solution below. We'll improve the solution later on. The current solution is the simplest way to render a list of notes.

We will use a special feature of JSX in form of `{}`. Within these braces we can mix JavaScript with JSX. In this case we will render a bunch of `li` elements. Each contains a `Note`.

In order to tell React in which order to render the elements, we'll set `key` property for each. It is important that this is unique or otherwise it won't be able to figure out the correct order in which to render and it will give a warning about this.

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
...

export default class App extends React.Component {
  render() {
    const notes = [
      {
        id: uuid.v4(),
        task: 'Learn webpack'
      },
      {
        id: uuid.v4(),
        task: 'Learn React'
      },
      {
        id: uuid.v4(),
        task: 'Do laundry'
      }
    ];

    return (
      <div>
        <ul>{notes.map(this.renderNote)}</ul>
      </div>
    );
  }
  renderNote(note) {
    return (
      <li key={`note${note.id}`}>
        <Note value={note.task} />
      </li>
    );
  }
}
```

If you run the application now, you can see it almost works. There's only one problem. Each `Note` shows the same text. Fortunately this is easy to fix.

T> If you want to attach comments to your JSX, just use `{/* no comments */}`.

T> Setting keys let's React understand where each element belongs when it's performing diffing over virtual DOM. It's a good idea to derive it based on a unique id as above. See [Multiple Components](https://facebook.github.io/react/docs/multiple-components.html) at React documentation for more information.

## Fixing Note

The problem is that we haven't taken `value` prop in count at `Note`. In React terms props are something that's passed to a component from outside. A component that takes only props and doesn't have any state, is known as a pure component. Pure components in particular are easy to test and work with. In the code below I extract the value of prop and render it.

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>{this.props.value}</div>;
  }
}
```

If you check out the application now, you should see we're seeing results that are more like it. This is only start, though. Our `App` is getting cramped. It feels like there's a component waiting to be extracted.

## Extracting Notes

If we keep on growing `App` like this we'll end up in trouble soon. When working with React it is important for you to learn to recognize possible components. We can extract `Notes` component from `App`. It will deal with rendering `Notes` and simplify our `App` somewhat.

As a first step we should extract the logic from `App`. It will accept `items` as a prop and render each just like our `App` did earlier. I attached some classes there so it's easier to style the component later.

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';

export default class Notes extends React.Component {
  render() {
    const notes = this.props.items;

    return <ul className='notes'>{notes.map(this.renderNote)}</ul>;
  }
  renderNote(note) {
    return (
      <li className='note' key={`note${note.id}`}>
        <Note value={note.task} />
      </li>
    );
  }
}
```

Next we need to hook up `App` to render through `Notes`.

**app/components/App.jsx**

```javascript
import uuid from 'node-uuid';
import React from 'react';
import Notes from './Notes';

export default class App extends React.Component {
  render() {
    const notes = [
      ...
    ];

    return (
      <div>
        <Notes items={notes} />
      </div>
    );
  }
}
```

Not only this change keeps `App` cleaner but it also gives us flexibility. If you wanted to have multiple `Notes` lists, it would be simple now.

## Adding New Items to Notes list

It would be useful if we could add new items to our Notes list. Let's just do a plus button that adds a new dummy item to our list.

To implement the button, change `render` method like this:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  render() {
    ...

    return (
      <div>
        <button onClick={this.addItem}>+</button>
        <Notes items={notes} />
      </div>
    );
  }
  addItem() {
    console.log('add item');
  }
}
```

Now when you click the button, you should see something at your browser console.

## Connecting `addItem` with Data Model

Next we will need to connect this with our data model somehow. It is problematic that data is stored within our `render` method. React provides a concept known as state for this purpose. We can move our data there like this:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn webpack'
        },
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    };
  }
  render() {
    const notes = this.state.notes;

    ...
  }
}
```

Now our `render` method points at `state`. As a result we can implement `addItem` that actually does something useful:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    super(props);

    ...

    this.addItem = this.addItem.bind(this);
  }
  ...
  addItem() {
    this.setState({
      notes: this.state.notes.concat([{
        id: uuid.v4(),
        task: 'New task'
      }])
    });
  }
}
```

If you hit the button now, you should see new items. It might not be pretty yet but it works.

### How Does `bind` Work?

We are using `bind` with `addItem` because we want to apply the right context to it. It will be `undefined` by default. As a result `this.setState` would fail. Through `this.addItem.bind(this)` we make sure it is bound to the current instance.

`bind` is useful beyond this usage. You can consider it the equivalent of inheritance but for functions. To give you a trivial example see below:

```javascript
function add(a, b) {
  return a + b;
}

const addTwo = add.bind(null, 2);

console.log(addTwo(6)); // 8
```

We are using `bind` at `constructor` to get a small performance benefit. If we applied it on `render`, it would have to be applied per `render`. I'll be using this convention unless it would additional effort through lifecycle hooks. In the future [property initializers](https://facebook.github.io/react/blog/2015/01/27/react-v0.13.0-beta-1.html#es7-property-initializers) may solve this issue with neat syntax.

## Editing Notes

Our Notes list is almost useful now. It is a little unfortunate that even though we can add new items to the list, we cannot modify them. It is time to implement edit.

A natural way to do this would be to allow the user to click an item. When an item is clicked, it would be replaced with an input control that would allow you to edit. After confirmed, the modification should remain there.

This means we'll need to extend `Note` somehow and communicate possible changes to `App` so that it knows to update the data model. In addition `Note` needs to keep track of its edit state and show the correct element (div or input) based on that.

We can achieve these goals using a callback and a ternary expression. Here's a sample implementation of the idea:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  constructor(props) {
    super(props);

    this.finishEdit = this.finishEdit.bind(this);
    this.checkEnter = this.checkEnter.bind(this);
    this.edit = this.edit.bind(this);
    this.renderEdit = this.renderEdit.bind(this);
    this.renderValue = this.renderValue.bind(this);

    this.state = {
      edited: false
    };
  }
  render() {
    const {value, onEdit, ...props} = this.props;
    const edited = this.state.edited;

    return <div {...props}>
      {edited ? this.renderEdit() : this.renderValue()}
    </div>;
  }
  renderEdit() {
    return <input type='text'
      defaultValue={this.props.value}
      onBlur={this.finishEdit}
      onKeyPress={this.checkEnter}/>;
  }
  renderValue() {
    return <div onClick={this.edit}>{this.props.value}</div>;
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

If you try to edit a `Note` now, you will see an error (`this.props.onEdit is not a function`) at console. We'll fix this shortly.

`Note` keeps track of *edited* state. We will manipulate that to change the way it is rendered. If we hit **edit**, we'll trigger edit mode. Once input receives either *blur* event or Enter key, we'll finish editing and reset the value. When finishing we also trigger a callback so the app knows to react.

We are using [ES7 rest spread operator](https://github.com/sebmarkbage/ecmascript-rest-spread) here to keep our props generic. In other words that `<div {...props}>` sets props as element attributes. This gives an additional extension point with little effort. You could for instance attach custom event handlers there or set some standard HTML attributes (e.g. `<Note title='Demo title' value={note.task} />`). I extract `value` and `onEdit` out of `props` as I **don't** want to set these at `div`.

T> It can be a good idea to name your callbacks using `on` prefix. This will allow you to distinguish them quickly from other props and keep your code a little tidier.

In order to make our edit work we'll need to define a callback for `App` like this:

**app/components/App.jsx**

```javascript
...
import findIndex from '../libs/find_index';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    ...

    this.addItem = this.addItem.bind(this);
    this.itemEdited = this.itemEdited.bind(this);
  }
  render() {
    ...
    <Notes items={notes} onEdit={this.itemEdited} />
    ...
  }
  ...
  itemEdited(noteId, task) {
    let notes = this.state.notes;
    const noteIndex = findIndex(notes, 'id', noteId);

    if(noteIndex < 0) {
      return console.warn('Failed to find note', notes, noteId);
    }

    notes[noteIndex].task = task;

    this.setState({notes});
  }
}
```

We are going to need a little helper to find array objects. If it finds something, it will return the index of the first match. This keeps our manipulations simple.

**app/libs/find_index.js**

```javascript
export default function findIndex(arr, prop, value) {
  const o = arr.filter(c => c[prop] === value)[0];
  const ret = o && arr.indexOf(o);

  return ret >= 0 ? ret : -1;
}
```

We also need to tweak `Notes` in order to bind the callback and pass the id of the edited `Note` to the parent:

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  constructor(props) {
    super(props);

    this.renderNote = this.renderNote.bind(this);
  }
  render() {
    const notes = this.props.items;

    return <ul className='notes'>{notes.map(this.renderNote)}</ul>;
  }
  renderNote(note) {
    return (
      <li className='note' key={`note${note.id}`}>
        <Note
          value={note.task}
          onEdit={this.props.onEdit.bind(null, note.id)} />
      </li>
    );
  }
}
```

After these changes you should be able to edit notes.

## Removing Notes

We are still missing one vital functionality. It would be nice to be able to remove notes. We can achieve this easily by extending edit.

In case we empty a task, it would make sense to remove it. You can give it a go yourself or follow the example below. It is just a matter of modifying state.

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  ...
  itemEdited(noteId, task) {
    let notes = this.state.notes;
    const noteIndex = findIndex(notes, 'id', noteId);

    if(noteIndex < 0) {
      return console.warn('Failed to find note', notes, noteId);
    }

    if(task) {
      notes[noteIndex].task = task;
    }
    else {
      notes = notes.slice(0, noteIndex).concat(notes.slice(noteIndex + 1));
    }

    this.setState({notes});
  }
}
```

If you empty an input now, the new logic should trigger and get rid of the `Note` in question.

T> We just introduced some interesting behavior to our system. As we track edit state on `Note` level, this means if you remove an item before the edited `Note`, the same old element remains edited. If we want to edit specific data, our data model should change to take this in count. Can you see how?

## Understanding React Components

Besides understanding how props and state work it is important to understand the concept of component lifecycle. We already touched it briefly above but it's a good idea to understand it in more detail. You can achieve most tasks in React by applying these three concepts throughout your application.

To quote [the official documentation](https://facebook.github.io/react/docs/component-specs.html) React provides the following `React.createClass` specific component specifications:

* `displayName` - It is preferable to set `displayName` as that will improve debug information. For ES6 classes this is derived automatically based on the class name.
* `getInitialState()` - In class based approach the same can be achieved through `constructor`.
* `getDefaultProps()` - In classes you can set these in `constructor`.
* `propTypes` - As seen above you can use Flow to deal with prop types. In `React.createClass` you would build a complex looking declaration as seen in [the propType documentation](https://facebook.github.io/react/docs/reusable-components.html).
* `mixins` - `mixins` contains an array of mixins to apply to component.
* `statics` - `statics` contains static properties and method for a component. In ES6 you would assign them to the class like below:

```javascript
class Note {
  render() {
    ...
  }
}
Note.willTransitionTo = () => {...};

export default Note;
```

Some libraries such as `react-dnd` rely on static methods to provide transition hooks that allow you to control what happens when a component is shown or hidden. By definition statics are available through class itself as you might guess from the code above.

Both component types support `render()`. As seen above this is the workhorse of React. It describes what the component should look like. In case you don't want to render anything return either `null` or `false`.

In addition React provides the following lifecycle hooks:

* `componentWillMount()` gets triggered once before any rendering. One way to use it would be to load data asynchronously there and force rendering through `setState`.
* `componentDidMount()` gets triggered after initial rendering. You have access to DOM here. You could use this hook to wrap a jQuery plugin within a component for instance.
* `componentWillReceiveProps(object nextProps)` triggers when component receives new props. You could for instance modify your component state based on the received props.
* `shouldComponentUpdate(object nextProps, object nextState)` allows you to optimize rendering. If you check the props and state and see that there's no need to update, return `false`.
* `componentWillUpdate(object nextProps, object nextState)` gets triggered after `shouldComponentUpdate` and before `render()`. It is not possible to use `setState` here but you can set class properties for instance.
* `componentDidUpdate` is triggered after rendering. You can modify DOM here. This can be useful for adapting other code to work with React.
* `componentWillUnmount` is triggered just before a component is unmounted from DOM. This is the ideal place to perform cleanup (e.g. remove running timers, custom DOM elements and so on).

## React Component Conventions

As seen in the above code I prefer to have `constructor` first, possible lifecycle hooks then, `render()` and finally methods used by `render()`. I like this top-down approach as it makes it straight-forward to follow code. Some prefer to put the methods used by `render()` before it. There are also various naming conventions. It is possible to use `_` prefix for event handlers for instance.

In the end you will have to find conventions you like and that work the best for you. I go more detail in this topic at the linting chapter as I introduce various code quality related tools. It is possible to enforce coding style to some extent for instance.

This can be useful in a team environment as it decreases the amount of friction when working on code written by others. Even on personal projects having some tools to check out things for you can be useful and lessen the amount and severity of mistakes.

## Conclusion

You can get quite far just with vanilla React. Unfortunately our little application is already bursting at seams and we have a lot of features to implement. In the next chapter we will clean things up as we introduce Flux architecture and port our application to use it.
