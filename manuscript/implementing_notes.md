# Implementing a Basic Note App

Given we have a nice development setup now, we can actually get some work done. Our goal here is to end up with a crude Note List with basic manipulation operations. Hit `npm start`. It's time to start developing.

## Extending Note

A good first step would be to extend `Note` interface. We would probably want to render a list of these. Ideally we should be able to perform basic editing operations over the list and create new items as needed. We'll probably also want to mark items as done.

This means `App` will have to coordinate the state. Let's start by rendering a list and then expand from there. Here's sample code for an enhanced `render` method:

**app/components/App.jsx**

```javascript
render() {
  var notes = [{
    task: 'Learn Webpack',
  }, {
    task: 'Learn React',
  }, {
    task: 'Do laundry',
  }];

  return (
    <div>
      <ul>{notes.map((note, i) =>
        <li key={'note' + i}>
          <Note value={note.task} />
        </li>
      )}</ul>
    </div>
  );
}
```

We will use a special feature of JSX in form of `{}`. Within these braces we can mix JavaScript with JSX. In this case we will render a bunch of `li` elements. Each contains a `Note`. In order to tell React in which order to render the elements, we'll set `key` property for each. It is important that this is unique or otherwise it won't be able to figure out the correct order.

T> If you want to attach comments to your JSX, just use `{/* no comments */}`.

If everything went correctly, you should see a list with three `Learn Webpack` items on it. That's almost nice. The problem is that we haven't taken `value` property in count at `Note`. We'll need to tweak its implementation like this:

**app/components/Note.jsx**

```javascript
render() {
  return <div>{this.props.value}</div>;
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
  render() {
    var notes = this.props.items;

    return (
      <ul className='notes'>{notes.map((note, i) =>
        <li className='note' key={'note' + i}>
          <Note value={note.task} />
        </li>
      )}</ul>
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
render() {
  ...

  return (
    <div>
      <Notes items={notes} />
    </div>
  );
}
...
```

Not only this change keeps `App` cleaner but it also gives us flexibility. If you wanted to have multiple `Notes` lists, it would be simple now. This is one of the key things to understand about React. You will need to learn to think in terms of components.

## Adding New Items to Notes list

It would be useful if we could add new items to our Notes list. Let's just do a plus button that adds a new dummy item to our list.

To get a button show up, change `render` method like this:

**app/components/App.jsx**

```javascript
render() {
  ...

  return (
    <div>
      <button onClick={this.addItem.bind(this)}>+</button>
      <Notes items={notes} />
    </div>
  );
}
addItem() {
  console.log('add item');
}
```

Now when you click the button, you should see something at your browser console.

## Connecting `addItem` with Data Model

Next we will need to connect this with our data model somehow. It is problematic that data is stored within our `render` method. React provides a concept known as state for this purpose. We can move our data there like this:

```javascript
constructor(props) {
  super(props);

  this.state = {
    notes: [{
      task: 'Learn Webpack',
    }, {
      task: 'Learn React',
    }, {
      task: 'Do laundry',
    }],
  };
}
render() {
  var notes = this.state.notes;
  ...
}
```

Now our `render` method points at `state`. As a result we can implement `addItem` that actually does something useful:

```javascript
addItem() {
  this.setState({
    notes: this.state.notes.concat([{
      task: 'New task',
    }])
  });
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

    this.state = {
      edited: false,
    };
  }
  render() {
    var edited = this.state.edited;
    var value = this.props.value;

    return (
      <div>{
        edited
        ? <input type='text'
          defaultValue={value}
          onBlur={this.finishEdit.bind(this)}
          onKeyPress={this.checkEnter.bind(this)}/>
        : <div onClick={this.edit.bind(this)}>{value}</div>
      }</div>
    );
  }
  edit() {
    this.setState({
        edited: true,
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
      edited: false,
    });
  }
}
```

It's a lot of code to digest. `Note` has *edited* state to keep track of. We will manipulate that to change the way it is rendered. If we hit **edit**, we'll trigger edit mode. Once input receives either *blur* event or Enter key, we'll finish editing and reset the value. When finishing we also trigger a callback so the app knows to react.

In order to make that happen we'll need to define that callback for `App` like this:

**app/components/App.jsx**

```javascript
render() {
  ...
  <Notes
    items={notes}
    onEdit={this.itemEdited.bind(this)} />
  ...
}
itemEdited(i, task) {
  var notes = this.state.notes;

  notes[i].task = task;

  this.setState({
    notes: notes,
  });
}
```

We also need to tweak `Notes` like this:

**app/components/Notes.jsx**

```javascript
...
<Note
  value={note.task}
  onEdit={this.props.onEdit.bind(this, i)} />
...
```

As you can see the nested hierarchy is starting to cause some subtle problems. We'll fix these later. Now we just want to get something to work. You should be able to edit todos now.

## Removing Notes

We are still missing one vital functionality. It would be nice to be able to remove notes. We can achieve this easily by extending edit.

In case we empty a task, it would make sense to remove it. You can give it a go yourself or follow the example below. It is just a matter of modifying state.

```javascript
itemEdited(i, task) {
  var notes = this.state.notes;

  if(task) {
    notes[i].task = task;
  }
  else {
    notes = notes.slice(0, i).concat(notes.slice(i + 1));
  }

  this.setState({
    notes: notes,
  });
}
```

An alternative way would have been to render some sort of button for removing an item. When pressed it would have triggered similar logic. If you feel like it, give it a go. Just have something like `<button onClick={this.removeItem.bind(null, i)}>-</button>` there, delete based on index and update state.

T> We just introduced some interesting behavior to our system. Note that as we track edit state on `Note` level, this means if you remove an item before the edited `Note`, the same old element remains edited. If we want to edit specific data, our data model should change to take this in count. Can you see how?

## Adding Type Checking with Flow

As we saw earlier with `onEdit`, it gave us a nasty error before we actually defined a handler for the case. Thanks to [Flow](http://flowtype.org/) and [Flowcheck](https://gcanti.github.io/flowcheck/) we can add typing information to our source. This is very useful in a situation where you are working with large project and many developers. Just like with linting earlier this is one way to make your work more boring. Boring is still good!

We can set up Flow type checking to our Webpack easily by first doing `npm i flowcheck-loader --save-dev` and then extending our development configuration a little like this:

```javascript
if(TARGET === 'dev') {
  module.exports = mergeConfig({
    ...
    module: {
      ...
      loaders: {
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel', 'flowcheck'],
          include: path.join(ROOT_PATH, 'app'),
        },
      },
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

## Conclusion

The approach we discussed works up to a point. It is a little ugly but it works. In the next chapter we will clean things up as we introduce Flux architecture and port our application to use it.
