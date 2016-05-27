# Implementing Persistency over `localStorage`

Currently our application cannot retain its state if refreshed. One neat way to get around this problem is to store the application state to [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) and then restore it when we run the application again.

If you were working against a back-end, this wouldn't be a problem. Even then having a temporary cache in `localStorage` could be handy. Just make sure you don't store anything sensitive there as it is easy to access.

## Understanding `localStorage`

`localStorage` is a part of the Web Storage API. The other half, `sessionStorage`, exists as long as the browser is open while `localStorage` persists even in this case. They both share [the same API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) as discussed below:

* `storage.getItem(k)` - Returns the stored string value for the given key.
* `storage.removeItem(k)` - Removes the data matching the key.
* `storage.setItem(k, v)` - Stores the given value using the given key.
* `storage.clear()` - Empties the storage contents.

It is convenient to operate on the API using your browser developer tools. In Chrome especially the *Resources* tab is useful as it allows you to inspect the data and perform direct operations on it. You can even use `storage.key` and `storage.key = 'value'` shorthands in the console for quick tweaks.

`localStorage` and `sessionStorage` can use up to 10 MB of data combined. Even though they are well supported, there are certain corner cases that can fail. These include running out of memory in Internet Explorer (fails silently) and failing altogether in Safari's private mode. It is possible to work around these glitches, though.

T> You can support Safari in private mode by trying to write into `localStorage` first. If that fails, you can use Safari's in-memory store instead, or just let the user know about the situation. See [Stack Overflow](https://stackoverflow.com/questions/14555347/html5-localstorage-error-with-safari-quota-exceeded-err-dom-exception-22-an) for details.

## Implementing a Wrapper for `localStorage`

To keep things simple and manageable, we will implement a little wrapper for `storage` to wrap the complexity. The API will consist of `get(k)` to fetch items from the storage and `set(k, v)` to set them. Given the underlying API is string based, we'll use `JSON.parse` and `JSON.stringify` for serialization. Since `JSON.parse` can fail, that's something we need to take into account. Consider the implementation below:

**app/libs/storage.js**

```javascript
export default storage => ({
  get(k) {
    try {
      return JSON.parse(storage.getItem(k));
    }
    catch(e) {
      return null;
    }
  },
  set(k, v) {
    storage.setItem(k, JSON.stringify(v));
  }
})
```

The implementation is enough for our purposes. It's not foolproof and it will fail if we put too much data into a storage. To overcome these problems without having to solve them yourself, it would be possible to use a wrapper such as [localForage](https://github.com/mozilla/localForage) to hide the complexity.

## Persisting the Application Using `FinalStore`

Just having means to write and read from the `localStorage` won't do. We still need to connect out application to it somehow. State management solutions provide hooks for this purpose. Often you'll find a way to intercept them somehow. In Alt's case that happens through a built-in store known as `FinalStore`.

We have already set it up at our Alt instance. What remains is writing the application state to the `localStorage` when it changes. We also need to load the state when we start running it. In Alt terms these processes are known as **snapshotting** and **bootstrapping**.

T> An alternative way to handle storing the data would be to take a snapshot only when the window gets closed. There's a Window level `beforeunload` hook that could be used. This approach is brittle, though. What if something unexpected happens and the hook doesn't get triggered for some reason? You'll lose data.

## Implementing Persistency Logic

We can handle the persistency logic at a separate module dedicated to it. We will hook it up at the application setup and off we go.

Given it can be useful to be able to disable snapshotting temporarily, it can be a good idea to implement a `debug` flag. The idea is that if the flag is set, we'll skip storing the data.

This is particularly useful if we manage to break the application state dramatically during development somehow as it allows us to restore it to a blank slate easily through `localStorage.setItem('debug', 'true')` (`localStorage.debug = true`), `localStorage.clear()`, and finally a refresh.

Given bootstrapping could fail for an unknown reason, we catch a possible error. It can still be a good idea to proceed with starting the application even if something horrible happens at this point. The snapshot portion is easier as we just need to check for the `debug` flag there and then set data if the flag is not active.

The implementation below illustrates the ideas:

**app/libs/persist.js**

```javascript
export default function(alt, storage, storageName) {
  try {
    alt.bootstrap(storage.get(storageName));
  }
  catch(e) {
    console.error('Failed to bootstrap data', e);
  }

  alt.FinalStore.listen(() => {
    if(!storage.get('debug')) {
      storage.set(storageName, alt.takeSnapshot());
    }
  });
}
```

You would end up with something similar in other state management systems. You'll need to find equivalent hooks to initialize the system with data loaded from the `localStorage` and write the state there when it happens to change.

## Connecting Persistency Logic with the Application

We are still missing one part to make this work. We'll need to connect the logic with our application. Fortunately there's a suitable place for this, the setup. Tweak as follows:

**app/components/Provider/setup.js**

```javascript
leanpub-start-insert
import storage from '../../libs/storage';
import persist from '../../libs/persist';
leanpub-end-insert
import NoteStore from '../../stores/NoteStore';

export default alt => {
  alt.addStore('NoteStore', NoteStore);

leanpub-start-insert
  persist(alt, storage(localStorage), 'app');
leanpub-end-insert
}
```

If you try refreshing the browser now, the application should retain its state. Given the solution is generic, adding more state to the system shouldn't be a problem. We could also integrate a proper back-end through the same hooks if we wanted.

If we had a real back-end, we could pass the initial payload as a part of the HTML and load it from there. This would avoid a round trip. If we rendered the initial markup of the application as well, we would end up implementing basic **universal rendering** approach. Universal rendering is a powerful technique that allows you to use React to improve the performance of your application while gaining SEO benefits.

W> Our `persist` implementation isn't without its flaws. It is easy to end up in a situation where `localStorage` contains invalid data due to changes made to the data model. This brings you to the world of database schemas and migrations. The lesson here is that the more you inject state and logic to your application, the more complicated it gets to handle.

## Cleaning Up `NoteStore`

Before moving on, it would be a good idea to clean up `NoteStore`. There's still some code hanging around from our earlier experiments. Given persistency works now, we might as well start from a blank slate. Even if we wanted some initial data, it would be better to handle that at a higher level, such as application initialization. Adjust `NoteStore` as follows:

**app/stores/NoteStore.js**

```javascript
leanpub-start-remove
import uuid from 'uuid';
leanpub-end-remove
import NoteActions from '../actions/NoteActions';

export default class NoteStore {
  constructor() {
    this.bindActions(NoteActions);

leanpub-start-remove
    this.notes = [
      {
        id: uuid.v4(),
        task: 'Learn React'
      },
      {
        id: uuid.v4(),
        task: 'Do laundry'
      }
    ];
leanpub-end-remove
leanpub-start-insert
    this.notes = [];
leanpub-end-insert
  }
  ...
}
```

This is enough for now. Now our application should start from a blank slate.

## Dispatching in Alt

Even though you can get far without ever using Flux dispatcher, it can be useful to know something about it. Alt provides two ways to use it. If you want to log everything that goes through your `alt` instance, you can use a snippet, such as `alt.dispatcher.register(console.log.bind(console))`. Alternatively, you could trigger `this.dispatcher.register(...)` at a store constructor. These mechanisms allow you to implement effective logging.

Other state management systems provide similar hooks. It is possible to intercept the data flow in many ways and even build custom logic on top of that.

## Alternative Implementations

Even though we ended up using Alt in this initial implementation, it's not the only option. In order to benchmark various architectures, I've implemented the same application using different techniques. I've compared them briefly below:

* [Redux](http://rackt.org/redux/) is a Flux inspired architecture that was designed with hot loading as its primary constraint. Redux operates based on a single state tree. The state of the tree is manipulated using *pure functions* known as reducers. Even though there's some boilerplate code, Redux forces you to dig into functional programming. The implementation is quite close to the Alt based one. - [Redux demo](https://github.com/survivejs/redux-demo)
* Compared to Redux, [Cerebral](http://www.cerebraljs.com/) had a different starting point. It was developed to provide insight on *how* the application changes its state. Cerebral provides more opinionated way to develop, and as a result, comes with more batteries included. - [Cerebral demo](https://github.com/survivejs/cerebral-demo)
* [MobX](https://mobxjs.github.io/mobx/) allows you to make your data structures observable. The structures can then be connected with React components so that whenever the structures update, so do the React components. Given real references between structures can be used, the Kanban implementation is surprisingly simple. - [MobX demo](https://github.com/survivejs/mobx-demo)

## Relay?

Compared to Flux, Facebook's [Relay](https://facebook.github.io/react/blog/2015/02/20/introducing-relay-and-graphql.html) improves on the data fetching department. It allows you to push data requirements to the view level. It can be used standalone or with Flux depending on your needs.

Given it's still largely untested technology, we won't be covering it in this book yet. Relay comes with special requirements of its own (GraphQL compatible API). Only time will tell how it gets adopted by the community.

## Conclusion

In this chapter, you saw how to set up `localStorage` for persisting the application state. It is a useful little technique to know. Now that we have persistency sorted out, we are ready to start generalizing towards a full blown Kanban board.
