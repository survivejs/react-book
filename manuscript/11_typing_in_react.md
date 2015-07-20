# Typing in React

Just like linting, typing is another feature that can make our lives easier especially when working with larger codebases. Some languages are very strict about this but as you know JavaScript is very flexible. One of the famous examples showcasing this flexibility is of course `Array(16).join("lol" - 2) + " Batman!";`.

Even though flexibility is a nice feature when you are prototyping and don't have strict interfaces in mind yet, it keeps your code quite brittle. Sure, you can implement tests to help with this problem. Typing can be considered as an another way to strengthen your code and make it harder to blow things up accidentally. That might be acceptable during early stages of development but it will hurt in production environment.

There are two major ways in which you can type in React. You can document the expectations of your components using `propTypes`. It is possible to go beyond this by using Flow, a syntax for gradual typing.

## `propTypes`

In [reactabular](https://github.com/bebraw/reactabular), a table library of mine, I use `propTypes` to communicate what my components expect to receive as props. For instance the definition of a `Table` looks like this:

```
// ES5
module.exports = React.createClass({
  displayName: 'Table',

  propTypes: {
    header: React.PropTypes.object,
    data: React.PropTypes.array,
    columns: React.PropTypes.array,
    row: React.PropTypes.func,
    children: React.PropTypes.object,
  },

  ...
});

// ES6
class Table extends React.Component {...}
Table.propTypes = {...}; // same as above here
export default Table;

// ES7 - proposed property initializer, Stage 0!
export default Table extends React.Component {
  static propTypes = {...} // same as above
}
```

I'm saying something specific about the interface of my library rather than hoping for the user to read the documentation thoroughly. By default the props are optional. It is possible to mark them as required using ´.isRequired` suffix. I could for instance annotate that `data: React.PropTypes.array.isRequired`. After this you couldn't use the `Table` without data passed to it.

Besides these basic possibilities `propTypes` allow you to communicate the shape of Objects you expect and mark optional types. Custom validators are possible as well. [The official documentation](https://facebook.github.io/react/docs/reusable-components.html) goes through these alternatives.

Note that React skips `propTypes` when run in production mode (`NODE_ENV=production`). You should consider them only as a development helper.

Even though `propTypes` can be nice, you can get equal results and then some by using Flow.

## Adding Type Checking with Flow

![Flow](images/flow.png)

TODO

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

### Patching Tools to Work with Decorators

![Flowcheck](images/flowcheck.png)

As we'll be relying on decorators and still like to use Flowcheck, we'll need to tweak configuration a little bit:

**webpack.config.js**

```javascript
if(TARGET === 'dev') {
  module.exports = merge(common, {
    ...
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel', 'flowcheck', 'babel?stage=1&blacklist=flow'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    }
  });
}
```

In effect we're letting Babel process everything except Flow parts before passing the output to Flowcheck. After the check has completed, we'll deal with the rest. This is bit of a hack that will hopefully go away sometime in the future as technology becomes more robust.

## Conclusion

TODO
