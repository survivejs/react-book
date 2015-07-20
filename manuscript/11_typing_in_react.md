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

## Type Checking with Flow

![Flow](images/flow.png)

[Flow](http://flowtype.org/) is Facebook's answer to the typing problem. There are entirely languages, such as [TypeScript](http://www.typescriptlang.org/), that focus on it and compile to JavaScript. Flow in comparison is a lighter approach. It has been implemented as a static type checker. I.e. it will run through your source a bit like linter. [Flowcheck](https://gcanti.github.io/flowcheck/) provides runtime checks based on your type definitions. [Babel Typecheck](https://github.com/codemix/babel-plugin-typecheck) is a Babel plugin that implements both.

As using Flow for static checking requires binaries of its own and the [official getting started guide](http://flowtype.org/docs/getting-started.html) covers it well, I won't go into detail here. Instead I will show you how to configure Flowcheck and Babel Typecheck. See [Try Flow](https://tryflow.org/) for more concrete examples. You can find a Flow annotated version of the project at [the project repository](https://github.com/survivejs/webpack_react).

### Configuring Flowcheck

![Flowcheck](images/flowcheck.png)

XXX: might as well drop this if Babel Typecheck works!

Integrating Flowcheck to a webpack project is fairly straightforward. In our case there's a gotcha, though. Flowcheck doesn't support decorator syntax yet. This means we'll need to perform some extra processing before applying it on our project.

In case you want to give Flowcheck a go, you should hit `npm i flowcheck-loader --save-dev` first and then extend configuration like this:

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

### Configuring Babel Typecheck

As mentioned above Babel Typecheck goes a step beyond Flowcheck. Configuring it is straight-forward. Hit `npm i --save-dev babel-plugin-typecheck` first and tweak configuration as follows:

**webpack.config.js**

```javascript
if(TARGET === 'dev') {
  module.exports = merge(common, {
    ...
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel?stage=1&plugins[]=typecheck'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    }
  });
}
```

...

## Conclusion

TODO
