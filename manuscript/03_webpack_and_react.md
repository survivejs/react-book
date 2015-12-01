# Webpack and React

Combined with Webpack React becomes a joy to work with. Even though you can use React with other build tools, Webpack is a good fit and quite straightforward to set up. In this chapter we'll expand our configuration. After that we have a good starting point for developing our application further.

T> Common editors (Sublime Text, Visual Studio Code, vim, emacs, Atom and such) have good support for React. Even IDEs such as [WebStorm](https://www.jetbrains.com/webstorm/) support it up to an extent. [Nuclide](http://nuclide.io/), an Atom based IDE, has been developed with React in mind.

## What is React?

![React](images/react_header.png)

Facebook's [React](https://facebook.github.io/react/) has changed the way we think about front-end development. Also, thanks to [React Native](https://facebook.github.io/react-native/) the approach isn't limited just to web. Although simple to learn, React provides plenty of power.

React isn't a framework like Angular.js or Ember. Frameworks tend to provide a lot of solutions out of the box. With React you will have to assemble your application from separate libraries. Both approaches have their merits. Frameworks may be faster to pick up, but they can become harder to work with as you hit their boundaries. In a library based approach you have more flexibility, but also responsibility.

React introduced a concept known as virtual DOM to web developers. React maintains a DOM of its own unlike all the libraries and frameworks before it. As changes are made to virtual DOM, React will batch the changes to the actual DOM as it sees best.

T> Libraries such as [Matt-Esch/virtual-dom](https://github.com/Matt-Esch/virtual-dom) focus entirely on Virtual DOM. If you are interested in the theory, check it out.

### JSX and Virtual DOM

React provides a [high level API](https://facebook.github.io/react/docs/top-level-api.html) for generating virtual DOM. Generating complex structures using the API becomes cumbersome fast. Thus people usually don't write it by hand. Instead, they use some intermediate format that is converted into it. Facebook's [JSX](https://facebook.github.io/jsx/) is one popular format.

JSX is a superset of JavaScript that allows you to mix XMLish syntax with JavaScript. Consider the example below:

```javascript
function render() {
  const names = ['John', 'Jill', 'Jack'];

  return (
    <div>
      <h2>Names</h2>

      <ul className="names">{
        names.map((name) =>
          <li className="name">{name}</li>
        )
      }</ul>
    </div>
  );
}
```

If you haven't seen JSX before it will likely look strange. It isn't uncommon to experience "JSX shock" until you start to understand it. After that it all makes sense.

Cory House goes into more detail [about the shock](https://medium.com/@housecor/react-s-jsx-the-other-side-of-the-coin-2ace7ab62b98). Briefly summarized, JSX gives us a level of validation we haven't encountered earlier. It takes a while to grasp, but once you get it, it's hard to go back.

T> Note that `render()` [must return a single node](https://facebook.github.io/react/tips/maximum-number-of-jsx-root-nodes.html). Returning multiple won't work!

In JSX we are mixing something that looks a bit like HTML with JavaScript. Note how we treat attributes. Instead of using `class` as we would in vanilla HTML, we use `className`, which is the DOM equivalent. Even though JSX will feel a little weird to use at first, it will become second nature over time.

The developers of React have decoupled themselves from the limitations of the DOM. As a result, React is highly performant. This comes with a cost, though. The library isn't as small as you might expect. You can expect bundle sizes for small applications to be around 150-200k, React included. That is considerably less when gzipped over the wire, but it's still something.

T> The interesting side benefit of this approach is that React doesn't depend on the DOM. In fact, React can use other targets, such as [mobile](https://facebook.github.io/react-native/), [canvas](https://github.com/Flipboard/react-canvas), or [terminal](https://github.com/Yomguithereal/react-blessed). The DOM just happens to be the most relevant one for web developers.

### Better with Friends

React isn't the smallest library out there. It does manage to solve fundamental problems, though. It is a pleasure to develop thanks to its relative simplicity and a powerful API. You will need to complement it with a set of tools, but you can pick these based on actual need. It's far from a "one size fits all" type of solution which frameworks tend to be.

The approach used by React allowed Facebook to develop React Native on top of the same ideas. This time instead of the DOM, we are operating on mobile platform rendering. React Native provides abstraction over components and a layout system. It provides you the setup you already know from the web. This makes it a good gateway for web developers wanting to go mobile.

## Babel

![Babel](images/babel.png)

[Babel](https://babeljs.io/) has made a big impact on the community. It allows us to use features from the future of JavaScript. It will transform your futuristic code to a format browsers understand. You can even use it to develop your own language features. Babel's built-in JSX support will come in handy here.

Babel provides support for certain [experimental features](https://babeljs.io/docs/usage/experimental/) from ES7 beyond standard ES6. Some of these might make it to the core language while some might be dropped altogether. The language proposals have been categorized within stages:

* **Stage 0** - Strawman
* **Stage 1** - Proposal
* **Stage 2** - Draft - Features starting from *stage 2* have been enabled by default
* **Stage 3** - Candidate
* **Stage 4** - Finished

I would be careful with **stage 0** features. The problem is that if the feature changes or gets removed you will end up with broken code and will need to rewrite it. In smaller experimental projects it may be worth the risk. In our project we'll enable **stage 1**. This allows us to use decorators and property spreading. These features will make our code a little tidier.

T> You can [try out Babel online](https://babeljs.io/repl/) to see what kind of code it generates.

### Configuring `babel-loader`

You can use Babel with Webpack easily through [babel-loader](https://www.npmjs.com/package/babel-loader). It takes our ES6 module definition based code and turn it into ES5 bundles. Install *babel-loader* with

```bash
npm i babel-loader@5.x --save-dev
```

W> We're using Babel 5 here for now as *babel-plugin-react-transform* still needs to receive its Babel 6 fixes. The configuration will change considerably with Babel 6!

Besides, we need to add a loader declaration to the *loaders* section of configuration. It matches against `.js` and `.jsx` using a regular expression (`/\.jsx?$/`).

To keep everything performant we restrict the loader to operate within `./app` directory. This way it won't traverse `node_modules`. An alternative would be to set up an `exclude` rule against `node_modules` explicitly. I find it more useful to `include` instead as that's more explicit. You never know what files might be in the structure after all.

Here's the relevant configuration we need to make Babel work:

**webpack.config.js**

```javascript
...

var common = {
  entry: PATHS.app,
  /* add resolve.extensions */
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      ...
      /* set up jsx */
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: PATHS.app
      }
    ]
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Kanban app'
    })
  ]
};

...
```

Note that `resolve.extensions` setting will allow you to refer to JSX files without an extension now. I'll be using the extension for clarity, but for now you can omit it.

T> As `resolve.extensions` gets evaluated from left to right, we can use it to control which code gets loaded for given configuration. For instance, you could have `.web.js` to define web specific parts and then have something like `['', '.web.js', '.js', '.jsx']`. If a "web" version of the file is found, Webpack would use that instead of the default.

Also, we are going to need a [.babelrc](https://babeljs.io/docs/usage/babelrc/). You could pass Babel settings through Webpack (i.e., `babel?stage=1`), but then it would be just for Webpack only. That's why we are going to push our Babel settings to this specific dotfile. The same idea applies for other tools such as ESLint. Set it up as follows to enable support for [class properties](https://github.com/jeffmo/es-class-static-properties-and-fields), [decorators](https://github.com/wycats/javascript-decorators), and [object rest spread](https://github.com/sebmarkbage/ecmascript-rest-spread). We'll be using these features in our project:

**.babelrc**

```json
{
  "optional": [
    "es7.classProperties",
    "es7.decorators",
    "es7.objectRestSpread"
  ]
}
```

Alternatively we could have a declaration such as `"stage": 1`. The problem is that this doesn't document well which experimental features we are using at our code base. It might work for small projects. Documenting your Babel usage this way will help in maintenance.

There are other possible [.babelrc options](https://babeljs.io/docs/usage/babelrc/). Now we are just keeping it simple. You could, for instance, enable the features you want to use explicitly.

T> It is possible to use Babel features at your Webpack configuration. Simply rename *webpack.config.js* as *webpack.config.babel.js* and Webpack will pick it up provided Babel has been set up with your project. It will respect the contents of *.babelrc*.

## Developing the First React View

It is time to add a first application level dependency to our project. Hit

```bash
npm i react react-dom --save
```

to get React installed. This will save React to the `dependencies` section of *package.json*. Later on we'll use this information to generate a vendor build for the production version. It's a good practice to separate application and development level dependencies this way.

*react-dom* is needed as React can be used to target multiple systems (DOM, mobile, terminal, i.e.,). Given we're dealing with the browser, *react-dom* is the correct choice here.

Now that we got that out of the way, we can start to develop our Kanban application. First we should define the `App`. This will be the core of our application. It represents the high level view of our app and works as an entry point. Later on it will orchestrate the entire app. We can get started by using React's function based component definition syntax:

**app/components/App.jsx**

```javascript
import React from 'react';
import Note from './Note.jsx';

export default () => {
  return <Note />;
};
```

T> You can import portions from `react` using syntax `import React, {Component} from 'react';`. Then you can do `class App extends Component`. It is important that you import `React` as well because that JSX will get converted to `React.createElement` calls. You may find this alternative a little neater regardless.

T> It may be worth your while to install [React Developer Tools](https://github.com/facebook/react-devtools) extension to your browser. Currently Chrome and Firefox are supported. This will make it easier to understand what's going on while developing.

W> It is important to note that ES6 based class approach **doesn't** support autobinding behavior. Apart from that you may find ES6 classes neater than `React.createClass`. See the end of this chapter for a comparison.

### Setting Up `Note`

We also need to define the `Note` component. In this case, we will just want to show some text like `Learn Webpack`. `Hello world` would work if you are into clichés.

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return <div>Learn Webpack</div>;
  }
}
```

T> Note that we're using *jsx* extension here. It helps us to tell modules using JSX syntax apart from regular ones. It is not absolutely necessary, but it is a good convention to have.

### Rendering Through `index.jsx`

We'll need to adjust our `index.js` to render the component correctly. Note that I've renamed it as `index.jsx` given we have JSX content there. First the rendering logic creates a DOM element where it will render. Then it renders our application through React.

**app/index.jsx**

```javascript
import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';

main();

function main() {
  const app = document.createElement('div');

  document.body.appendChild(app);

  ReactDOM.render(<App />, app);
}
```

I'll be using `const` whenever possible. It will give me a guarantee that the reference to the object won't get changed inadvertently. It does allow you to change the object contents, though, in that you can still push new items to an array and so on.

If I want something mutable, I'll use `let` instead. `let` is scoped to the code block and is another new feature introduced with ES6. These both are good safety measures.

W> Avoid rendering directly to `document.body`. This can cause strange problems when relying on it. Instead give React a little sandbox of its own. That way everyone, including React, will stay happy.

If you hit `npm start` now, you should see something familiar at **localhost:8080**.

![Hello React](images/react_01.png)

Before moving on, this is a good chance to get rid of the old `component.js` file. It might be hanging around at `app` root.

## Activating Hot Loading for Development

Note that every time you perform a modification, the browser updates with a flash. That's unfortunate because this means our application loses state. It doesn't matter yet, but as we keep on expanding the application this will become painful. It is annoying to manipulate the user interface back to the state in which it was to test something.

We can work around this problem using hot loading. [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform) allow us to instrument React components in various ways. Hot loading is one of these. It is enabled through [react-transform-hmr](https://github.com/gaearon/react-transform-hmr).

*react-transform-hmr* will swap React components one by one as they change without forcing a full refresh. Given it just replaces methods, it won't catch every possible change. This includes changes made to class constructors. There will be times when you will need to force a refresh, but it will work most of the time.

To enable hot loading for React, you should first install the packages using

```bash
npm i babel-plugin-react-transform react-transform-hmr --save-dev
```

We also need to make Babel aware of HMR. First we should pass target environment to Babel through our Webpack configuration:

**webpack.config.js**

```javascript
...

process.env.BABEL_ENV = TARGET;

var common = {
  ...
};

...
```

In addition we need to expand Babel configuration to include the plugin we need during development:

**.babelrc**

```json
{
  "optional": [
    "es7.classProperties",
    "es7.decorators",
    "es7.objectRestSpread"
  ],
  "env": {
    "start": {
      "plugins": [
        "react-transform"
      ],
      "extra": {
        "react-transform": {
          "transforms": [
            {
              "transform": "react-transform-hmr",
              "imports": ["react"],
              "locals": ["module"]
            }
          ]
        }
      }
    }
  }
}
```

Try hitting `npm start` again and modifying the component. Note what doesn't happen this time. There's no flash! It might take a while to sink in, but in practice, this is a powerful feature. Small things such as this add up and make you more effective.

Note that Babel determines the value of `env` like this:

1. Use the value of `BABEL_ENV` if set.
2. Use the value of `NODE_ENV` if set.
3. Default to `development`.

T> If you want to show errors directly in the browser, you can configure [react-transform-catch-errors](https://github.com/gaearon/react-transform-catch-errors). At the time of writing it works reliable only with `devtool: 'eval'`, but regardless it may be worth a look.

W> Note that sourcemaps won't get updated in [Chrome](https://code.google.com/p/chromium/issues/detail?id=492902) and Firefox due to browser level bugs! This may change in the future as the browsers get patched, though.

## React Component Styles

Besides ES6 classes, React allows you to construct components using `React.createClass()`. That was the original way to create components and it is still in use. The approaches aren't equivalent by default.

When you are using `React.createClass` it is possible to inject functionality using mixins. This isn't possible in ES6 by default. Yet, you can use a helper such as [react-mixin](https://github.com/brigand/react-mixin). In later chapters we will go through various alternative approaches. They allow you to reach roughly equivalent results as you can achieve with mixins. Often a decorator is all you need.

Also, ES6 class based components won't bind their methods to `this` context by default. This is the reason why it's good practice to bind the context at the component constructor. We will use this convention in this book. It leads to some extra code, but later on it is likely possible to refactor it out.

The class based approach decreases the amount of concepts you have to worry about. `constructor` helps to keep things simpler than in `React.createClass` based approach. There you need to define separate methods to achieve the same result.

## Conclusion

You should understand how to set up React with Webpack now. Hot loading is one of those features that sets Webpack apart. Now that we have a good development environment, we can focus on React development. In the next chapter you will see how to implement a little note taking application. That will be improved in the subsequent chapters into a full blown Kanban table.
