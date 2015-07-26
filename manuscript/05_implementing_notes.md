# Implementing a Basic Note App

Given we have a nice development setup now, we can actually get some work done. Our goal here is to end up with a crude Note List with basic manipulation operations. We will start by doing things the hard way. We will grow our application from scratch and get into some trouble. After that you should understand better why architecture models such as Flux are needed.

## Extending Note

A good first step would be to extend `Note` interface. We would probably want to render a list of these. Ideally we should be able to perform basic editing operations over the list and create new items as needed. We'll probably also want to mark items as done.

This means `App` will have to coordinate the state. Let's start by rendering a list and then expand from there. Here's sample code for an enhanced `render` method:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.renderNote = this.renderNote.bind(this);
  }
  render() {
    var notes = [{
      task: 'Learn webpack'
    }, {
      task: 'Learn React'
    }, {
      task: 'Do laundry'
    }];

    return (
      <div>
        <ul>{notes.map(this.renderNote)}</ul>
      </div>
    );
  }
  renderNote(note, i) {
    return (
      <li key={`note${i}`}>
        <Note value={note.task} />
      </li>
    );
  }
}
```

We will use a special feature of JSX in form of `{}`. Within these braces we can mix JavaScript with JSX. In this case we will render a bunch of `li` elements. Each contains a `Note`. In order to tell React in which order to render the elements, we'll set `key` property for each. It is important that this is unique or otherwise it won't be able to figure out the correct order.

T> If you want to attach comments to your JSX, just use `{/* no comments */}`.

If everything went correctly, you should see a list with three `Learn webpack` items on it. That's almost nice. The problem is that we haven't taken `value` property in count at `Note`. We'll need to tweak its implementation like this:

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>{this.props.value}</div>;
  }
}
```

As you can see the property we passed to our component gets mapped to `this.props`. After that it is just a matter of showing it wherever we like.

We haven't achieved much yet but we're getting there. In order to get somewhere, we'll need to expand and refine our component hierarchy.

## Refining Component Hierarchy

It is nice to keep the implementation of `App` on a high level. Currently there are concerns that might not belong there. We can improve the situation by splitting `Notes` into a component of its own. It will be just a component that takes *items* as an input and renders them as above.

We'll want to end up a hierarchy such as this: App -> Notes -> Note. Each of these components will map to a file within `components`. Our `Note` is fine as is. `Notes` needs to be extracted out of `App`. Here's a sample implementation:

**app/components/Notes.jsx**

```javascript
import React from 'react';
import Note from './Note';

export default class Notes extends React.Component {
  constructor(props) {
    super(props);

    this.renderNote = this.renderNote.bind(this);
  }
  render() {
    var notes = this.props.items;

    return <ul className='notes'>{notes.map(this.renderNote)}</ul>;
  }
  renderNote(note, i) {
    return (
      <li className='note' key={`note${i}`}>
        <Note value={note.task} />
      </li>
    );
  }
}
```

I attached some classes there so it's easier to style the component later.

Remember to replace the old list with `<Notes items={notes} />` at *App.jsx*:

**app/components/App.jsx**

```javascript
import Notes from './Notes';

...

export default class App extends React.Component {
  render() {
    ...

    return (
      <div>
        <Notes items={notes} />
      </div>
    );
  }
  ...
}
```

Not only this change keeps `App` cleaner but it also gives us flexibility. If you wanted to have multiple `Notes` lists, it would be simple now. This is one of the key things to understand about React. You will need to learn to think in terms of components.

## Adding New Items to Notes list

It would be useful if we could add new items to our Notes list. Let's just do a plus button that adds a new dummy item to our list.

To implement the button, change `render` method like this:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
  }
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

T> Note that we're binding `addItem` context at constructor. It would be possible to do the same at `render`. Unfortunately that will hurt performance given it would `bind` each time `render` gets triggered. Therefore it makes most sense to deal with bindings at constructor level.

## Connecting `addItem` with Data Model

Next we will need to connect this with our data model somehow. It is problematic that data is stored within our `render` method. React provides a concept known as state for this purpose. We can move our data there like this:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [{
        task: 'Learn webpack'
      }, {
        task: 'Learn React'
      }, {
        task: 'Do laundry'
      }]
    };
  }
  render() {
    var notes = this.state.notes;

    ...
  }
}
```

Now our `render` method points at `state`. As a result we can implement `addItem` that actually does something useful:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  ...
  addItem() {
    this.setState({
      notes: this.state.notes.concat([{
        task: 'New task'
      }])
    });
  }
}
```

If you hit the button now, you should see new items. It might not be pretty yet but it works.

## Editing Notes

Our Notes list is almost useful now. It is a little unfortunate that even though we can add new items to the list, we cannot modify them. It is time to implement edit.

A natural way to do this would be to allow the user to click an item. When an item is clicked, it would be replaced with an input control that would allow you to edit. After confirmed, the modification should remain there.

This means we'll need to extend `Note` somehow and communicate possible changes to `App` so that it knows to update the data model. In addition `Note` needs to keep track of its edit state and show the correct element (div or input) based on that.

We can achieve these goals using a callback and a ternary expression. Here's a sample implementation of the idea:

**app/components/Note.jsx**

```javascript
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
    var edited = this.state.edited;

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

`Note` keeps track of *edited* state. We will manipulate that to change the way it is rendered. If we hit **edit**, we'll trigger edit mode. Once input receives either *blur* event or Enter key, we'll finish editing and reset the value. When finishing we also trigger a callback so the app knows to react.

We are using [ES7 rest spread operator](https://github.com/sebmarkbage/ecmascript-rest-spread) here to keep our props generic. In other words that `<div {...props}>` sets props as element attributes. This gives an additional extension point with little effort. You could for instance attach custom event handlers there or set some standard HTML attributes (e.g. `<Note title='Demo title' value={note.task} />`). I extract `value` and `onEdit` out of `props` as I **don't** want to set these at `div`.

T> It can be a good idea to name your callbacks using `on` prefix. This will allow you to distinguish them quickly from other props and keep your code a little tidier.

In order to make that happen we'll need to define that callback for `App` like this:

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.addItem = this.addItem.bind(this);
    this.itemEdited = this.itemEdited.bind(this);

    this.state = {
      edited: false
    };
  }
  render() {
    ...
    <Notes
      items={notes}
      onEdit={this.itemEdited} />
    ...
  }
  itemEdited(i, task) {
    var notes = this.state.notes;

    notes[i].task = task;

    this.setState({
      notes: notes
    });
  }
}
```

We also need to tweak `Notes` like this:

**app/components/Notes.jsx**

```javascript
...

export default class Notes extends React.Component {
  ...
  render() {
    var notes = this.props.items;

    return <ul className='notes'>{notes.map(this.renderNote)}</ul>;
  }
  renderNote(note, i) {
    return (
      <li className='note' key={`note${i}`}>
        <Note
          value={note.task}
          onEdit={this.props.onEdit.bind(null, i)} />
      </li>
    );
  }
}
```

After these changes you should be able to edit notes.

T> We could listen to `componentWillReceiveProps` hook and build the binds based on that. To keep this example simple I'll skip that.

## Removing Notes

We are still missing one vital functionality. It would be nice to be able to remove notes. We can achieve this easily by extending edit.

In case we empty a task, it would make sense to remove it. You can give it a go yourself or follow the example below. It is just a matter of modifying state.

**app/components/App.jsx**

```javascript
...

export default class App extends React.Component {
  ...
  itemEdited(i, task) {
    var notes = this.state.notes;

    if(task) {
      notes[i].task = task;
    }
    else {
      notes = notes.slice(0, i).concat(notes.slice(i + 1));
    }

    this.setState({
      notes: notes
    });
  }
}
```

An alternative way would have been to render some sort of button for removing an item. When pressed it would have triggered similar logic. If you feel like it, give it a go. Just have something like `<button onClick={(i) => this.removeItem(i)}>-</button>` there, delete based on index and update state.

T> We just introduced some interesting behavior to our system. Note that as we track edit state on `Note` level, this means if you remove an item before the edited `Note`, the same old element remains edited. If we want to edit specific data, our data model should change to take this in count. Can you see how?

## Adding Type Checking with Flow

![Flow](images/flow.png)

As we saw earlier with `onEdit`, it gave us a nasty error before we actually defined a handler for the case. Thanks to [Flow](http://flowtype.org/) and [Flowcheck](https://gcanti.github.io/flowcheck/) we can add typing information to our source. This is very useful in a situation where you are working with large project and many developers

We can set up Flow type checking to our webpack easily by first doing `npm i flowcheck-loader --save-dev` and then extending our development configuration a little like this:

```javascript
if(TARGET === 'dev') {
  module.exports = merge(common, {
    ...
    module: {
      ...
      loaders: {
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel?stage=1', 'flowcheck'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      }
    },
    ...
  });
}
```

Now we can start typing. For instance you could attach types for `Note` props like this:

```javascript
constructor(props: {
  value: string;
  onEdit: Function;
}) {...}
```

`Notes` would look similar expect in that case we would perform an assertion like

```javascript
constructor(props: {
  items: Array;
  onEdit: Function;
}) {...}
```

With Flow you can type the most vital parts of your source. You can think it as an executable form of documentation that helps you during development. As with linting it won't replace tests but it will make it easier to work with the source. See [Try Flow](https://tryflow.org/) for more concrete examples.

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

The approach we discussed works up to a point. It is a little ugly but it works. In the next chapter we will clean things up as we introduce Flux architecture and port our application to use it.
