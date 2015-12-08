# Understanding Decorators

If you have used languages such as Java or Python before, you might be familiar with the idea. Decorators are syntactic sugar that allow us to wrap and annotate classes and functions. In their [current proposal](https://github.com/wycats/javascript-decorators) (stage 1) only class and method level wrapping is supported. Functions may become supported later on.

## Implementing Logging Decorator

Sometimes it is useful to know how methods are being called. You could of course attach `console.log` there but it's more fun to implement `@log`. That's a more controllable way to deal with it. Consider the example below:

```javascript
class Math {
  @log
  add(a, b) {
    return a + b;
  }
}

function log(target, name, descriptor) {
  var oldValue = descriptor.value;

  descriptor.value = function() {
    console.log(`Calling "${name}" with`, arguments);

    return oldValue.apply(null, arguments);
  };

  return descriptor;
}

const math = new Math();

// passed parameters should get logged now
math.add(2, 4);
```

The idea is that our `log` decorator wraps the original function, triggers a `console.log`, and finally calls it again while passing the original [arguments](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/arguments) to it. Especially if you haven't seen `arguments` or `apply` before, it might seem a little strange.

`apply` can be thought as an another way to invoke a function while passing its context (`this`) and parameters as an array. `arguments` receives function parameters implicitly so it's ideal for this case.

This logger could be pushed to a separate module. After that we could use it across our application whenever we want to log some methods. Once implemented decorators become powerful building blocks.

The decorator receives three parameters:

* `target` maps to the instance of the class.
* `name` contains the name of the method being decorated.
* `descriptor` is the most interesting piece as it allows us to annotate the method and manipulate its behavior. It could look for example like this:

```javascript
const descriptor = {
  value: () => {...},
  enumerable: false,
  configurable: true,
  writable: true
};
```

As you saw above, `value` makes it possible to shape the behavior. The rest allows you to modify behavior on method level. For instance, a `@readonly` decorator could limit access. `@memoize` is another interesting example as that allows you to implement easy caching for methods.

## Implementing `@connect`

`@connect` will wrap our component in another component. That in turn will deal with the connection logic (`listen/unlisten/setState`). It will maintain the store state internally and then pass it to the child component that we are wrapping. During this process it will pass the state through props. The implementation below illustrates the idea:

**app/decorators/connect.js**

```javascript
import React from 'react';

const connect = (Component, store) => {
  return class Connect extends React.Component {
    constructor(props) {
      super(props);

      this.storeChanged = this.storeChanged.bind(this);
      this.state = store.getState();

      store.listen(this.storeChanged);
    }
    componentWillUnmount() {
      store.unlisten(this.storeChanged);
    }
    storeChanged() {
      this.setState(store.getState());
    }
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
};

export default (store) => {
  return (target) => connect(target, store);
};
```

Can you see the wrapping idea? Our decorator tracks store state. After that it passes the state to the component contained through props.

T> `...` is known as [ES7 rest spread operator](https://github.com/sebmarkbage/ecmascript-rest-spread). It expands the given object to separate key-value pairs, or props, as in this case.

You can connect the decorator with `App` like this for example:

**app/components/App.jsx**

```javascript
...
import connect from '../decorators/connect';

...

@connect(NoteStore)
export default class App extends React.Component {
  render() {
    const notes = this.props.notes;

    ...
  }
  ...
}
```

Pushing the logic to a decorator allows us to keep our components simple. If we wanted to add more stores to the system and connect them to components, it would be trivial now. Even better we could connect multiple stores to a single component easily.

## Decorator Ideas

We can build new decorators for various functionalities, such as undo, in this manner. They allow us to keep our components tidy and push common logic elsewhere out of sight. Well designed decorators can be used across projects.

### Alt's `@connectToStores`

Alt provides a similar decorator known as `@connectToStores`. It relies on static methods.  Rather than normal methods that are bound to a specific instance, these are bound on class level. This means you can call them through the class itself (i.e., `App.getStores()`). The example below shows how we might integrate `@connectToStores` into our application.

```javascript
...
import connectToStores from 'alt/utils/connectToStores';

@connectToStores
export default class App extends React.Component {
  static getStores(props) {
    return [NoteStore];
  }
  static getPropsFromStores(props) {
    return NoteStore.getState();
  }
  ...
}
```

This more verbose approach is roughly equivalent to our implementation. It actually does more as it allows you to connect to multiple stores at once. It also provides more control over the way you can shape store state to props.

To get familiar with more approaches we'll be using the `AltContainer` in this project. Using the decorator is completely acceptable. It comes down to your personal preferences.

## Conclusion

Even though still a little experimental, decorators provide nice means to push logic where it belongs. Better yet, they provide us a degree of reusability while keeping our components neat and tidy.
