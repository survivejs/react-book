# Webpack and React

Combined with webpack React becomes a joy to work with. Even though you can use React with other build tools, webpack is a good fit and quite straightforward to set up. In this chapter we'll expand our configuration so that we have a good starting point for developing our application further.

T> Common editors (Sublime Text, vim, emacs, Atom etc.) have good support for React. Even IDEs such as [WebStorm](https://www.jetbrains.com/webstorm/) support it up to an extent. [Nuclide](http://nuclide.io/), an Atom based IDE, has been developed with React in mind. Tooling might not support the newest language features always but overall the situation is good.

## What is React?

![React](images/react_header.png)

Facebook's [React](https://facebook.github.io/react/) is one of those projects that has changed the way we think about frontend development. Also, thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

React isn't a framework like Angular.js or Ember. Frameworks tend to provide a lot of solutions out of the box. With React you will have to assemble your application from separate libraries. Both approaches have their merits. Frameworks may be faster to pick up but they can become harder to work with as you hit their boundaries. In a library based approach you have more flexibility but also responsibility.

React introduced a concept known as virtual DOM to web developers. This means that instead of manipulating DOM directly just like all the libraries and frameworks before it, React maintains a DOM of its own. As changes are made to virtual DOM, React will batch the changes to actual DOM as it sees best.

T> Libraries such as [Matt-Esch/virtual-dom](https://github.com/Matt-Esch/virtual-dom) focus entirely on Virtual DOM. If you are interested in the theory, check it out.

### JSX and Virtual DOM

React provides a [high level API](https://facebook.github.io/react/docs/top-level-api.html) for generating virtual DOM. As generating complex structures using the API becomes cumbersome fast, people usually don't write it by hand. Instead they use some intermediate format that is converted into it. Facebook's [JSX](https://facebook.github.io/jsx/) is one popular format.

JSX is a superset of JavaScript that allows you to mix XMLish syntax with JavaScript as shown in the example below:

```javascript
function render() {
  const names = ['John', 'Jill', 'Jack'];

  return (
    <h2>Names</h2>

    <ul className='names'>{
      names.map((name) =>
        <li className='name'>{name}</li>
      )
    }</ul>
  );
}
```

If you haven't seen JSX before it will likely look strange. It isn't uncommon to experience "JSX shock", a form of disbelief, until you start to understand it. After that it all makes sense.

In JSX we are mixing something that looks a bit like HTML with JavaScript. Note how we treat attributes. Instead of using `class` as we would in vanilla HTML, we use `className`, which is the DOM equivalent. Even though JSX will feel a little weird to use at first it will become second nature over time.

Because of virtual DOM the developers of React have decoupled themselves from the limitations of DOM. As a result React is highly performant. This comes with a cost, though. The library isn't as small as you might expect. You can expect bundle sizes for small applications to be around 150-200k, React included. That is considerably less when gzipped over wire but it's still something.

T> The interesting side benefit of this approach is that React doesn't depend on DOM. In fact React can use other targets, such as [mobile](https://facebook.github.io/react-native/), [canvas](https://github.com/Flipboard/react-canvas) or [terminal](https://github.com/Yomguithereal/react-blessed). DOM just happens to be the most relevant one for web developers.

### Better with Friends

Even if React isn't the smallest library out there it does manage to solve fundamental problems. It is a pleasure to develop thanks to its relative simplicity and a powerful API. You will need to complement it with a set of tools but you can pick these based on actual need. It's far from a "one size fits all" type of solution which frameworks tend to be.

The approach used by React allowed Facebook to develop React Native on top of the same ideas. This time instead of DOM, we are operating on mobile platform rendering. React Native provides abstraction over components and a layout system while providing you the setup you already know from the web. It can be seen as a gateway for web developers wanting to develop performant mobile applications.

## Babel

![Babel](images/babel.png)

[Babel](https://babeljs.io/) is one of those projects that has made a big impact on the community. It allows us to use features from the future of JavaScript. It will transform your futuristic code to a format browsers understand. You can even use it to develop your own language features. Babel's built-in JSX support will come in handy here.

In addition to the standardized ES6 features Babel provides support for certain [experimental features](https://babeljs.io/docs/usage/experimental/) from ES7. Some of these might make it to the core language while some might be dropped altogether. The language proposals have been categorized within stages:

* **Stage 0** - Strawman
* **Stage 1** - Proposal
* **Stage 2** - Draft - Features starting from *stage 2* have been enabled by default
* **Stage 3** - Candidate
* **Stage 4** - Finished

I would be especially careful with **stage 0** features. The problem is that if the feature changes or gets removed you will end up with broken code and will need to rewrite it. In smaller experimental projects it may be worth the risk. In our project we'll enable **stage 1** in order to use decorators and property spreading as they will make our code a little tidier.

T> You can [try out Babel online](https://babeljs.io/repl/) to see what kind of code it generates.

### Configuring `babel-loader`

You can use Babel with Webpack easily through [babel-loader](https://www.npmjs.com/package/babel-loader). It will take our ES6 module definition based code and turn it into ES5 bundles while allowing you to use the new features of the language. Install *babel-loader* with

> npm i babel-core babel-loader --save-dev

In addition, we need to add a loader declaration to the *loaders* section of configuration. It will tell Webpack to match against `.js` and `.jsx` (`/\.jsx?$/`) using a regular expression.

To keep everything performant we restrict the loader to operate within `./app` directory. This way it won't traverse `node_modules`. An alternative would be to set up an `exclude` rule against `node_modules` explicitly but I find it more useful to `include` instead as that's more explicit. You never know what files might be in the structure after all.

Here's the relevant configuration we need to make Babel work:

**webpack.config.js**

```javascript
...

var common = {
  entry: path.resolve(ROOT_PATH, 'app/main.jsx'),
  ...
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval',
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['babel'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    }
  });
}
```

In addition we are going to need a [.babelrc](https://babeljs.io/docs/usage/babelrc/). You could pass Babel settings through Webpack (i.e. `babel?stage=1`) but then it would be just for Webpack only. That's why we are going to push our Babel settings to this specific dotfile. The same idea applies for other tools such as ESLint.

**.babelrc**

```json
{
  "stage": 1
}
```

There are other possible [.babelrc options](https://babeljs.io/docs/usage/babelrc/). Now we are just keeping it simple. You could for instance enable the features you want to use explicitly.

T> If you want Webpack to find JSX files without having to use the extension, set up `resolve.extensions = ['', '.js', '.jsx']`. We will refer to JSX files with extension as that works well with the isomorphic solution we'll discuss later on. It also allows you to tell files apart quickly based on the `require` statement.

T> If you are using Babel in your project, you can also use it to process your Webpack configuration. Simply rename it as `webpack.config.babel.js` and Webpack will pass it through Babel allowing you to use ES6 module syntax and features. It will pick up `.babelrc` settings. That's one reason why we're using it.

## Developing First React View

It is time to add a first application level dependency to our project. Hit

> npm i react --save

to get React installed. This will save React to `dependencies` section of `package.json`. Later on we'll be using this information to generate a vendor build for the production version. I find it to be a good practice to separate application and development level dependencies this way.

Now that we got that out of the way we can start to develop our Kanban application. First we should define the `App`. This will be the core of our application. It represents the high level view of it and works as an entry point. Later on it will orchestrate it all.

**app/components/App.jsx**

```javascript
import React from 'react';
import Note from './Note.jsx';

export default class App extends React.Component {
  render() {
    return <Note />;
  }
}
```

T> You can import specific portions from `react` using a syntax like `import React, { Component } from 'react';`. Then you can do `class App extends Component`. You may find this alternative a little neater.

W> If you are used to `React.createClass()`, it is important to note that ES6 based class approach **doesn't** support autobinding behavior. Apart from that you may find ES6 classes neater. See the end of this chapter for a comparison.

### Setting Up `Note`

We also need to define the `Note` component. In this case we will just want to show some text like `Learn Webpack`. `Hello world` would work if you are into clichés.

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>Learn Webpack</div>;
  }
}
```

T> Note that we're using *jsx* extension here to tell modules using JSX syntax apart from regular ones. It is not absolutely necessary but it is a good convention to have.

### Rendering Through `main.jsx`

We'll need to adjust our `main.js` to render the component correctly. Note that I've renamed it as `main.jsx` given we have JSX content there. First the rendering logic creates a DOM element where to render and then it renders our application through React.

**app/main.jsx**

```javascript
import './main.css';

import React from 'react';
import App from './components/App.jsx';

main();

function main() {
  const app = document.createElement('div');

  document.body.appendChild(app);

  React.render(<App />, app);
}
```

I'll be using `const` whenever possible. It will give me a guarantee that the reference to the object won't get changed inadvertently. It does allow you to modify the object contents, though, i.e. you can still push new items to an array and so on.

If I want something mutable, I'll use `let` instead. `let` is scoped to the code block and is another new feature introduced with ES6. These both are good safety measures.

W> Avoid rendering directly to `document.body`. This can cause strange problems with relying on it. Instead give React a little sandbox of its own. That way everyone, including React, will stay happy.

If you hit `npm start` now, you should see something familiar at **localhost:8080**.

Before moving on this is a good chance to get rid of the old `component.js` file that might be hanging around at `app` root.

## Activating Hot Loading for Development

Note that every time you perform a modification, the browser updates with a flash. That's unfortunate because this means our application loses state. It doesn't matter yet but as we keep on expanding the application this will become painful. It is annoying to manipulate the user interface back to the state in which it was in order to test something.

We can work around this problem using hot loading. This is enabled by [react-hot-loader](https://gaearon.github.io/react-hot-loader/). It will swap React components one by one as they change without forcing a full refresh. There will be times when that will be necessary but it will help a lot. Once you get used to hot loading, it is hard to live without.

To enable hot loading for React, you should first install the package using

> npm i react-hot-loader --save-dev

We also need to make our configuration aware of it so it can inject hooks Webpack requires for the system to work.

**webpack.config.js**

```javascript
...

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval',
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    }
  });
}
```

Try hitting `npm start` again and modifying the component. Note what doesn't happen this time. There's no flash! It might take a while to sink in but in practice this is a powerful feature. Small things such as this add up and make you more effective.

## React Component Styles

Besides ES6 classes React allows you to construct components using `React.createClass()`. That was the original way to create components and it is still in use. The approaches aren't equivalent by default.

When you are using `React.createClass` it is possible to inject functionality to a component using mixins. This isn't possible in ES6 by default unless you are using a helper such as [react-mixin](https://github.com/brigand/react-mixin). In later chapters we will go through various alternative approaches that allow you to reach roughly equivalent results as you can achieve with mixins. Often a decorator is all you need.

In addition, ES6 class based components won't bind their methods to `this` context by default. This is the reason why it's good practice to bind the context at the component constructor. We will use this convention in this book. It leads to some extra code but later on it is likely possible to refactor it out.

The biggest benefit of the class based approach is that it decreases the amount of concepts you have to worry about. Particularly, `constructor` helps to keep things simpler than in `React.createClass` based approach where you need to define separate methods to achieve the same result.

In the future property initializers (likely `tick = () => { ... }`) will solve this neatly. In fact the proposed feature is available through Babel's **stage 0** but enabling that may lead to other problems later on in case the features change.

## Conclusion

You should understand how to set up React with Webpack now. Hot loading is one of those features that sets Webpack apart. Now that we have a good development environment, we can focus on React development. In the next chapter you will see how to implement a little note taking application. That will be improved in the subsequent chapters into a full blown Kanban table.
