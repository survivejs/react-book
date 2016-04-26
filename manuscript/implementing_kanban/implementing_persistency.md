# Implementing Persistency over `localStorage`

We will modify our implementation of `NoteStore` next to persist the data on change. This way we don't lose our data after a refresh. One way to achieve this is to use [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage). It is a well supported feature that allows you to persist data to the browser.

## Understanding `localStorage`

`localStorage` has a sibling known as `sessionStorage`. Whereas `sessionStorage` loses its data when the browser is closed, `localStorage` retains its data. They both share [the same API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) as discussed below:

* `storage.getItem(k)` - Returns the stored string value for the given key.
* `storage.removeItem(k)` - Removes the data matching the key.
* `storage.setItem(k, v)` - Stores the given value using the given key.
* `storage.clear()` - Empties the storage contents.

Note that it is convenient to operate on the API using your browser developer tools. For instance, in Chrome you can see the state of the storages through the *Resources* tab. *Console* tab allows you to perform direct operations on the data. You can even use `storage.key` and `storage.key = 'value'` shorthands for quick modifications.

`localStorage` and `sessionStorage` can use up to 10 MB of data combined. Even though they are well supported, there are certain corner cases with interesting failures. These include running out of memory in Internet Explorer (fails silently) and failing altogether in Safari's private mode. It is possible to work around these glitches, though.

T> You can support Safari in private mode by trying to write into `localStorage` first. If that fails, you can use Safari's in-memory store instead, or just let the user know about the situation. See [Stack Overflow](https://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an) for details.

## Implementing a Wrapper for `localStorage`

To keep things simple and manageable, we can implement a little wrapper for `storage`. It will wrap all of these complexities. The API expects strings.

As objects are convenient, we'll use `JSON.parse` and `JSON.stringify` for serialization. We need just `storage.get(k)` and `storage.set(k, v)` as seen in the implementation below:

**app/libs/storage.js**

```javascript
export default {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    }
    catch(e) {
      return null;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  }
};
```

The implementation could be generalized further. You could convert it into a factory (`storage => {...}`) and make it possible to swap the storage. Now we are stuck with `localStorage` unless we change the code.

T> We're operating with `localStorage` directly to keep the implementation simple. An alternative would be to use [localForage](https://github.com/mozilla/localForage) to hide all the complexity. You could even integrate it behind our interface.

## Persisting Application Using `FinalStore`

Besides this little utility, we'll need to adapt our application to use it. Alt provides a built-in store called `FinalStore` which is perfect for this purpose. We can persist the entire state of our application using `FinalStore`, bootstrapping, and snapshotting. `FinalStore` is a store that listens to all existing stores. Every time some store changes, `FinalStore` will know about it. This makes it ideal for persistency.

We can take a snapshot of the entire app state and push it to `localStorage` every time `FinalStore` changes. That solves one part of the problem. Bootstrapping solves the remaining part as `alt.bootstrap` allows us to set state of the all stores. The method doesn't emit events. To make our stores populate with the right state, we will need to call it before the components are rendered. In our case, we'll fetch the data from `localStorage` and invoke it to populate our stores.

T> An alternative way would be to take a snapshot only when the window gets closed. There's a Window level `beforeunload` hook that could be used. The problem with this approach is that it is brittle. What if something unexpected happens and the hook doesn't get triggered for some reason? You'll lose data.

In order to integrate this idea to our application, we will need to implement a little module to manage it. We take the possible initial data into account there and trigger the new logic.

*app/libs/persist.js*  does the hard part. It will set up a `FinalStore`, deal with bootstrapping (restore data) and snapshotting (save data). I have included an escape hatch in the form of the `debug` flag. If it is set, the data won't get saved to `localStorage`. The reasoning is that by doing this, you can set the flag (`localStorage.setItem('debug', 'true')`), hit `localStorage.clear()` and refresh the browser to get a clean slate. The implementation below illustrates these ideas:

**app/libs/persist.js**

```javascript
import makeFinalStore from 'alt-utils/lib/makeFinalStore';

export default function(alt, storage, storeName) {
  const finalStore = makeFinalStore(alt);

  try {
    alt.bootstrap(storage.get(storeName));
  }
  catch(e) {
    console.error('Failed to bootstrap data', e);
  }

  finalStore.listen(() => {
    if(!storage.get('debug')) {
      storage.set(storeName, alt.takeSnapshot());
    }
  });
}
```

Finally, we need to trigger the persistency logic at initialization. We will need to pass the relevant data to it (Alt instance, storage, storage name) and off we go.

**app/index.jsx**

```javascript
...
leanpub-start-insert
import alt from './libs/alt';
import storage from './libs/storage';
import persist from './libs/persist';

persist(alt, storage, 'app');
leanpub-end-insert

ReactDOM.render(<App />, document.getElementById('app'));
```

If you try refreshing the browser now, the application should retain its state. The solution should scale with minimal effort if we add more stores to the system. Integrating a real back-end wouldn't be a problem. There are hooks in place for that now.

You could, for instance, pass the initial payload as a part of your HTML (universal rendering), load it up, and then persist the data to the back-end. You have a great deal of control over how to do this, and you can use `localStorage` as a backup if you want.

Universal rendering is a powerful technique that allows you to use React to improve the performance of your application while gaining SEO benefits. Rather than leaving all rendering to the front-end, we perform a part of it at the back-end side. We render the initial application markup at back-end and provide it to the user. React will pick that up. This can also include data that can be loaded to your application without having to perform extra queries.

W> Our `persist` implementation isn't without its flaws. It is easy to end up in a situation where `localStorage` contains invalid data due to changes made to the data model. This brings you to the world of database schemas and migrations. There are no easy solutions. Regardless, this is something to keep in mind when developing something more sophisticated. The lesson here is that the more you inject state to your application, the more complicated it gets.

## Using the `AltContainer`

The [AltContainer](http://alt.js.org/docs/components/altContainer/) wrapper allows us to simplify connection logic greatly and cut down the amount of logic needed. The implementation below illustrates how to bind it all together. Note how much code we can remove!

**app/components/App.jsx**

```javascript
leanpub-start-insert
import AltContainer from 'alt-container';
leanpub-end-insert
import React from 'react';
import Notes from './Notes.jsx';
import NoteActions from '../actions/NoteActions';
import NoteStore from '../stores/NoteStore';

export default class App extends React.Component {
leanpub-start-delete
  constructor(props) {
    super(props);

    this.state = NoteStore.getState();
  }
  componentDidMount() {
    NoteStore.listen(this.storeChanged);
  }
  componentWillUnmount() {
    NoteStore.unlisten(this.storeChanged);
  }
  storeChanged = (state) => {
    // Without a property initializer `this` wouldn't
    // point at the right context (defaults to `undefined` in strict mode).
    this.setState(state);
  };
leanpub-end-delete
  render() {
leanpub-start-delete
    const notes = this.state.notes;
leanpub-end-delete

    return (
      <div>
        <button className="add-note" onClick={this.addNote}>+</button>
leanpub-start-delete
        <Notes notes={notes}
          onEdit={this.editNote}
          onDelete={this.deleteNote} />
leanpub-end-delete
leanpub-start-insert
        <AltContainer
          stores={[NoteStore]}
          inject={{
            notes: () => NoteStore.getState().notes
          }}
        >
          <Notes onEdit={this.editNote} onDelete={this.deleteNote} />
        </AltContainer>
leanpub-end-insert
      </div>
    );
  }
  ...
}
```

The `AltContainer` allows us to bind data to its immediate children. In this case, it injects the `notes` property in to `Notes`. The pattern allows us to set up arbitrary connections to multiple stores and manage them. You can find another possible approach at the appendix about decorators.

Integrating the `AltContainer` tied this component to Alt. If you wanted something forward-looking, you could push it into a component of your own. That facade would hide Alt and allow you to replace it with something else later on.

## Dispatching in Alt

Even though you can get far without ever using Flux dispatcher, it can be useful to know something about it. Alt provides two ways to use it. If you want to log everything that goes through your `alt` instance, you can use a snippet, such as `alt.dispatcher.register(console.log.bind(console))`. Alternatively, you could trigger `this.dispatcher.register(...)` at a store constructor. These mechanisms allow you to implement effective logging.

## Alternative Implementations

Even though we ended up using Alt in our implementation, it's not the only option. In order to benchmark various architectures, I've implemented the same application using different techniques. I've compared them briefly below:

* [Redux](http://rackt.org/redux/) is a Flux inspired architecture that was designed with hot loading as its primary constraint. Redux operates based on a single state tree. The state of the tree is manipulated using *pure functions* known as reducers. Even though there's some boilerplate code, Redux forces you to dig into functional programming. The implementation is quite close to the Alt based one. - [Redux demo](https://github.com/survivejs/redux-demo)
* Compared to Redux, [Cerebral](http://www.cerebraljs.com/) had a different starting point. It was developed to provide insight on *how* the application changes its state. Cerebral provides more opinionated way to develop, and as a result, comes with more batteries included. - [Cerebral demo](https://github.com/survivejs/cerebral-demo)
* [MobX](https://mobxjs.github.io/mobx/) allows you to make your data structures observable. The structures can then be connected with React components so that whenever the structures update, so do the React components. Given real references between structures can be used, the Kanban implementation is surprisingly simple. - [MobX demo](https://github.com/survivejs/mobx-demo)

## Relay?

Compared to Flux, Facebook's [Relay](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) improves on the data fetching department. It allows you to push data requirements to the view level. It can be used standalone or with Flux depending on your needs.

Given it's still largely untested technology, we won't be covering it in this book yet. Relay comes with special requirements of its own (GraphQL compatible API). Only time will tell how it gets adopted by the community.

## Conclusion

In this chapter, you saw how to set up `localStorage` and improve the application further. We are ready to extend the application now and start getting closer to a full blown Kanban.
