# Language Features

ES6 (or ES2015) was arguably the biggest change to JavaScript in a long time. As a result, we received a wide variety of new functionality. The purpose of this appendix is to illustrate the features used in the book in isolation to make it clearer to understand how they work. Rather than going through [the entire specification](http://www.ecma-international.org/ecma-262/6.0/index.html), I will just focus on the subset of features used in the book.

## Modules

ES6 introduced proper module declarations. Earlier, this was somewhat ad hoc and we used formats, such as AMD or CommonJS. See the *Webpack Compared* chapter for descriptions of those. Both formats are still in use, but it's always better to have something standard in place.

ES6 module declarations are statically analyzable. This is highly useful for tool authors. Effectively, this means we can gain features like *tree shaking*. This allows the tooling to skip unused code easily simply by analyzing the import structure.

### `import` and `export` for Single

To give you an example of exporting directly through a module, consider below:

**persist.js**

```javascript
import makeFinalStore from 'alt-utils/lib/makeFinalStore';

export default function(alt, storage, storeName) {
  ...
}
```

**index.js**

```javascript
import persist from './persist';

...
```

### `import` and `export` for Multiple

Sometimes it can be useful to use modules as a namespace for multiple functions:

**math.js**

```javascript
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export function square(a) {
  return a * a;
}
```

Alternatively we could write the module in a form like this:

**math.js**

```javascript
const add = (a, b) => a + b;
const multiple = (a, b) => a * b;

// You can omit ()'s with a single parameter if you want.
const square = a => a * a;

export {add, multiple};

// Equivalent to
//export {add: add, multiple: multiple};
```

The example leverages the *fat arrow syntax* and the *property value shorthand*.

This definition can be consumed through an import like this:

**index.js**

```javascript
import {add} from './math';

// Alternatively we could bind the math methods to a key
// import * as math from './math';
// math.add, math.multiply, ...

...
```

Especially `export default` is useful if you prefer to keep your modules focused. The `persist` function is an example of such. Regular `export` is useful for collecting multiple functions below the same umbrella.

T> Given the ES6 module syntax is statically analyzable, it enables tooling such as [analyze-es6-modules](https://www.npmjs.com/package/analyze-es6-modules).

### Aliasing Imports

Sometimes it can be handy to alias imports. Example:

```javascript
import {actions as TodoActions} from '../actions/todo'

...
```

`as` allows you to avoid naming conflicts.

### Webpack `resolve.alias`

Bundlers, such as Webpack, can provide some features beyond this. You could define a `resolve.alias` for some of your module directories for example. This would allow you to use an import, such as `import persist from 'libs/persist';`, regardless of where you import. A simple `resolve.alias` could look like this:

```javascript
...
resolve: {
  alias: {
    libs: path.join(__dirname, 'libs')
  }
}
```

The official documentation describes [possible variants](https://webpack.github.io/docs/configuration.html#resolve-alias) in fuller detail.

## Classes

Unlike many other languages out there, JavaScript uses prototype based inheritance instead of class based one. Both approaches have their merits. In fact, you can mimic a class based model through a prototype based one. ES6 classes are about providing syntactical sugar above the basic mechanisms of JavaScript. Internally it still uses the same old system. It just looks a little different to the programmer.

These days React supports class based component definitions. Not all agree that it's a good thing. That said, the definition can be quite neat as long as you don't abuse it. To give you a simple example, consider the code below:

```javascript
import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    // This is a regular property outside of React's machinery.
    // If you don't need to trigger render() when it's changed,
    // this can work.
    this.privateProperty = 'private';

    // React specific state. Alter this through `this.setState`. That
    // will call `render()` eventually.
    this.state = {
      name: 'Class demo'
    };
  }
  render() {
    // Use the properties somehow.
    const privateProperty = this.privateProperty;
    const name = this.state.name
    const notes = this.props.notes;

    ...
  }
}
```

Perhaps the biggest advantage of the class based approach is the fact that it cuts down some complexity, especially when it comes to React lifecycle hooks. It is important to note that class methods won't get by default, though! This is why the book relies on an experimental feature known as property initializers.

### Classes and Modules

As stated above, the ES6 modules allow `export` and `import` single and multiple objects, functions, or even classes. In the latter, you can use `export default class` to export an anonymous class or export multiple classes from the same module using `export class className`.

To export and import a single class you can use `export default class` to export an anonymous class and call it whatever you want at import time:

**Note.jsx**

```javascript
export default class extends React.Component { ... };
```

**Notes.jsx**

```javascript
import Note from './Note.jsx';
...
```

Or use `export class className` to export several named classes from a single module:

**Components.jsx**

```javascript
export class Note extends React.Component { ... };

export class Notes extends React.Component { ... };
```

**App.jsx**

```javascript
import Notes from './Components.jsx';
import Note from './Components.jsx';

...
```

It is recommended to keep your classes separated in different modules.

## Class Properties and Property Initializers

ES6 classes won't bind their methods by default. This can be problematic sometimes, as you still may want to be able to access the instance properties. Experimental features known as [class properties and property initializers](https://github.com/jeffmo/es-class-static-properties-and-fields) solve this problem. Without them, we might write something like this:

```javascript
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.renderNote = this.renderNote.bind(this);
  }
  render() {
    // Use `renderNote` here somehow.
    ...

    return this.renderNote();
  }
  renderNote() {
    // Given renderNote was bound, we can access `this` as expected
    return <div>{this.props.note}</div>;
  }
}
App.propTypes = {
  value: React.PropTypes.string
};
App.defaultProps = {
  value: ''
};

export default App;
```

Using class properties and property initializers we could write something tidier instead:

```javascript
import React from 'react';

export default class App extends React.Component {
  // propType definition through static class properties
  static propTypes = {
    value: React.PropTypes.string
  };
  static defaultProps = {
    value: ''
  };
  render() {
    // Use `renderNote` here somehow.
    ...

    return this.renderNote();
  }
  // Property initializer gets rid of the `bind`
  renderNote = () => {
    // Given renderNote was bound, we can access `this` as expected
    return <div>{this.props.note}</div>;
  };
}
```

Now that we've pushed the declaration to method level, the code reads better. I decided to use the feature in this book primarily for this reason. There is simply less to worry about.

## Functions

Traditionally, JavaScript has been very flexible with its functions. To give you a better idea, see the implementation of `map` below:

```javascript
function map(cb, values) {
  var ret = [];
  var i, len;

  for(i = 0, len = values.length; i < len; i++) {
    ret.push(cb(values[i]));
  }

  return ret;
}

map(function(v) {
  return v * 2;
}, [34, 2, 5]); // yields [68, 4, 10]
```

In ES6 we could write it as follows:

```javascript
function map(cb, values) {
  const ret = [];
  const i, len;

  for(i = 0, len = values.length; i < len; i++) {
    ret.push(cb(values[i]));
  }

  return ret;
}

map((v) => v * 2, [34, 2, 5]); // yields [68, 4, 10]
```

The implementation of `map` is more or less the same still. The interesting bit is at the way we call it. Especially that `(v) => v * 2` part is intriguing. Rather than having to write `function` everywhere, the fat arrow syntax provides us a handy little shorthand. To give you further examples of usage, consider below:

```javascript
// These are the same
v => v * 2;
(v) => v * 2; // I prefer this variant for short functions
(v) => { // Use this if you need multiple statements
  return v * 2;
}

// We can bind these to a variable
const double = (v) => v * 2;

console.log(double(2));

// If you want to use a shorthand and return an object,
// you need to wrap the object.
v => ({
  foo: 'bar'
});
```

### Arrow Function Context

Arrow functions are special in that they don't have `this` at all. Rather, `this` will point at the caller object scope. Consider the example below:

```javascript
var obj = {
  context: function() {
    return this;
  },
  name: 'demo object 1'
};

var obj2 = {
  context: () => this,
  name: 'demo object 2'
};

console.log(obj.context()); // { context: [Function], name: 'demo object 1' }
console.log(obj2.context()); // {} in Node.js, Window in browser
```

As you can notice in the snippet above, the anonymous function has a `this` pointing to the `context` function in the `obj` object. In other words, it is binding the scope of the caller object `obj` to the `context` function.

This happens because `this` doesn't point to the object scopes that contains it, but the caller object scopes, as you can see it in the next snippet of code:

```javascript
console.log(obj.context.call(obj2)); // { context: [Function], name: 'demo object 2' }
```

The arrow function in the object `obj2` doesn't bind any object to its context, following the normal lexical scoping rules resolving the reference to the nearest outer scope. In this case it happens to be Node.js `global` object.

Even though the behavior might seem a little weird, it is actually useful. In the past, if you wanted to access parent context, you either needed to `bind` it or attach the parent context to a variable `var that = this;`. The introduction of the arrow function syntax has mitigated this problem.

### Function Parameters

Historically, dealing with function parameters has been somewhat limited. There are various hacks, such as `values = values || [];`, but they aren't particularly nice and they are prone to errors. For example, using `||` can cause problems with zeros. ES6 solves this problem by introducing default parameters. We can simply write `function map(cb, values=[])` now.

There is more to that and the default values can even depend on each other. You can also pass an arbitrary amount of parameters through `function map(cb, values...)`. In this case, you would call the function through `map(a => a * 2, 1, 2, 3, 4)`. The API might not be perfect for `map`, but it might make more sense in some other scenario.

There are also convenient means to extract values out of passed objects. This is highly useful with React component defined using the function syntax:

```javascript
export default ({name}) => {
  // ES6 string interpolation. Note the back-ticks!
  return <div>{`Hello ${name}!`}</div>;
};
```

## String Interpolation

Earlier, dealing with strings was somewhat painful in JavaScript. Usually you just ended up using a syntax like `'Hello' + name + '!'`. Overloading `+` for this purpose wasn't perhaps the smartest move as it can lead to strange behavior due to type coercion. For example, `0 + ' world` would yield `0 world` string as a result.

Besides being clearer, ES6 style string interpolation provides us multi-line strings. This is something the old syntax didn't support. Consider the examples below:

```javascript
const hello = `Hello ${name}!`;
const multiline = `
multiple
lines of
awesomeness
`;
```

The back-tick syntax may take a while to get used to, but it's powerful and less prone to mistakes.

## Destructuring

That `...` is related to the idea of destructuring. For example, `const {lane, ...props} = this.props;` would extract `lane` out of `this.props` while the rest of the object would go to `props`. This object based syntax is still experimental. ES6 specifies an official way to perform the same for arrays like this:

```javascript
const [lane, ...rest] = ['foo', 'bar', 'baz'];

console.log(lane, rest); // 'foo', ['bar', 'baz']
```

The spread operator (`...`) is useful for concatenating. You see syntax like this in Redux examples often. They rely on experimental [Object rest/spread syntax](https://github.com/sebmarkbage/ecmascript-rest-spread):

```javascript
[...state, action.lane];

// This is equal to
state.concat([action.lane])
```

The same idea applies to React components:

```javascript
...

render() {
  const {value, onEdit, ...props} = this.props;

  return <div {...props}>Spread demo</div>;
}

...
```

W> There are several gotchas related to the spread operator. Given it is *shallow* by default, it can lead to interesting behavior that might be unexpected. This is particularly true if you are trying to use it to clone an object using it. Josh Black discusses this problem in detail at his Medium post titled [Gotchas in ES2015+ Spread](https://medium.com/@joshblack/gotchas-in-es2015-spread-5db06dfb1e10).

## Object Initializers

In order to make it easier to work with objects, ES6 provides a variety of features just for this. To quote [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer), consider the examples below:

```javascript
const a = 'demo';
const shorthand = {a}; // Same as {a: a}

// Shorthand methods
const o = {
  get property() {},
  set property(value) {},
  demo() {}
};

// Computed property names
const computed = {
  [a]: 'testing' // demo -> testing
};
```

## `const`, `let`, `var`

In JavaScript, variables are global by default. `var` binds them on *function level*. This is in contrast to many other languages that implement *block level* binding. ES6 introduces block level binding through `let`.

There's also support for `const`, which guarantees the reference to the variable itself cannot change. This doesn't mean, however, that you cannot modify the contents of the variable. So if you are pointing at an object, you are still allowed to tweak it!

I tend to favor to default to `const` whenever possible. If I need something mutable, `let` will do fine. It is hard to find any good use for `var` anymore as `const` and `let` cover the need in a more understandable manner. In fact, all of the book's code, apart from this appendix, relies on `const`. That just shows you how far you can get with it.

## Decorators

Given decorators are still an experimental feature and there's a lot to cover about them, there's an entire appendix dedicated to the topic. Read *Understanding Decorators* for more information.

## Conclusion

There's a lot more to ES6 and the upcoming specifications than this. If you want to understand the specification better, [ES6 Katas](http://es6katas.org/) is a good starting point for learning more. Just having a good idea of the basics will take you far.
