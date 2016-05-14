# Introduction to React

Facebook's [React](https://facebook.github.io/react/) has changed the way we think about web applications and user interface development. Due to its design, you can use it beyond web. A feature known as **Virtual DOM** enables this.

In this chapter we'll go through some of the basic ideas behind the library and get the first "Hello World" showing up. That's how you always get started with a new technology after all. Getting up and running is a prerequisite for other work after all.

T> Common editors (Sublime Text, Visual Studio Code, vim, emacs, Atom and such) have good support for React. Even IDEs, such as [WebStorm](https://www.jetbrains.com/webstorm/), support it up to an extent. [Nuclide](http://nuclide.io/), an Atom based IDE, has been developed with React in mind.

W> If you use an IDE, disable a feature known as **safe write**. It is known to cause issues with the setup we'll be using in this book.

## What is React?

![React](images/react_header.png)

React is a JavaScript library that forces you to think in terms of components. This model of thinking fits user interfaces well. Depending on your background it might feel alien at first. You will have to think very carefully about the concept of `state` and where it belongs.

Given state management is a difficult problem, a variety of solutions have appeared. In this book we'll start by managing state ourselves and then push it to a Flux implementation known as Alt. There are also implementations available for several other alternatives, such as Redux, MobX, and Cerebral.

React is pragmatic in sense that it contains a set of escape hatches. If the React model doesn't work for you, it is still possible to revert back to something lower level. There are hooks that can be used to wrap older logic that relies on the DOM for instance. This breaks the abstraction and ties your code to a specific environment, but sometimes that's the pragmatic thing to do.

## Virtual DOM

![Virtual DOM](images/vdom.png)

One of the fundamental problems of programming is how to deal with state. Suppose you are developing a user interface and want to show the same data in multiple places. How do you make sure the data is consistent? Historically we have mixed the concerns of the DOM and state and tried to manage it there. React solves this problem in a different way. It introduced the concept of **Virtual DOM** to the masses.

Virtual DOM exists on top of the actual DOM, or some other render target. It solves the state manipulation problem in its own way. Whenever changes are made to it, it figures out the best way to batch the changes to the underlying DOM structure. It is able to propagate changes across its virtual tree as in the image above.

Handling DOM manipulation this way can lead to good performance. Manipulating the DOM by hand tends to be inefficient and it's hard to optimize it. By leaving the problem if DOM manipulation to a good implementation, you avoid effort.

A React application might not be performant by default, but it is possible to tune it by implementing hooks to avoid unnecessary updates to the virtual tree. Often this is optional, though.

The biggest cost of Virtual DOM is that the implementation makes React quite big. You can expect the bundle sizes of small applications to be around 150-200 kB minified, React included. gzipping will help, but it's still big.

T> Solutions such as [preact](https://developit.github.io/preact/) and [react-lite](https://github.com/Lucifier129/react-lite) allow you to reach far smaller bundle sizes while sacrificing some functionality. If you are size conscious, consider checking out these solutions.

T> Libraries, such as [Matt-Esch/virtual-dom](https://github.com/Matt-Esch/virtual-dom) or [paldepind/snabbdom](https://github.com/paldepind/snabbdom), focus entirely on Virtual DOM. If you are interested in the theory and want to understand it further, check these out.

## React Renderers

As mentioned, React's approach decouples it from the web. You can use it to implement interfaces across multiple platforms. In this case we'll be using a renderer known as [react-dom](https://www.npmjs.com/package/react-dom). It supports both client and server side rendering.

### Universal Rendering

We could use react-dom to implement so called *universal* rendering. The idea is that the server renders the initial markup and passes the initial data to the client. This improves performance by avoiding unnecessary round trips as each request comes with an overhead. It is also useful for search optimization (SEO) purposes.

Even though the technique sounds simple, it can be difficult to implement for larger scale applications. But it's still something worth knowing about.

Sometimes using the server side part of react-dom is enough. You can use it to [generate invoices](https://github.com/bebraw/generate-invoice) for example. That's one way to use React in a flexible manner. Generating reports is a common need after all.

### Available React Renderers

Even though react-dom is the most used renderer, there are a few others you might want to be aware of. I've listed some of the well known alternatives below:

* [React Native](https://facebook.github.io/react-native/) - React Native is a framework and renderer for mobile platforms including iOS and Android. You can also run [React Native applications on the web](https://github.com/necolas/react-native-web).
* [react-blessed](https://github.com/Yomguithereal/react-blessed) - react-blessed allows you to write terminal applications using React. It's even possible to animate them.
* [gl-react](https://projectseptemberinc.gitbooks.io/gl-react/content/) - gl-react provides WebGL bindings for React. You can write shaders this way for example.
* [react-canvas](https://github.com/Flipboard/react-canvas) - react-canvas provides React bindings for the Canvas element.

## `React.createElement` and JSX

Given we are operating with virtual DOM, there's a [high level API](https://facebook.github.io/react/docs/top-level-api.html) for handling it. A naïve React component written using the JavaScript API could look like this:

```javascript
const Names = () => {
  const names = ['John', 'Jill', 'Jack'];

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Names'),
    React.createElement(
      'ul',
      { className: 'names' },
      names.map(name => {
        return React.createElement(
          'li',
          { className: 'name' },
          name
        );
      })
    )
  );
};
```

As it is verbose to write components this way and the code is quite hard to read, often people prefer to use a language known as [JSX](https://facebook.github.io/jsx/) instead. Consider the same component written using JSX below:

```javascript
const Names = () => {
  const names = ['John', 'Jill', 'Jack'];

  return (
    <div>
      <h2>Names</h2>

      {/* This is a list of names */}
      <ul className="names">{
        names.map(name =>
          <li className="name">{name}</li>
        )
      }</ul>
    </div>
  );
};
```

Now we can see the component renders a set of names within a HTML list. It might not be the most useful component, but it's enough to illustrate the basic idea of JSX. It provides us a syntax that resembles HTML. It also provides a way to write JavaScript within it by using braces (`{}`).

Compared to vanilla HTML, there are a few important differences, though. Note that we are using `className` instead of `class`. This is because the API has been modeled after the DOM naming. It takes some getting used to and you might experience a "JSX shock" until you begin to appreciate the approach.

Cory House goes into more detail [about the shock](https://medium.com/@housecor/react-s-jsx-the-other-side-of-the-coin-2ace7ab62b98). Briefly summarized, JSX gives us a level of validation we haven't encountered earlier. It takes a while to grasp, but once you get it, it's hard to go back.

T> Note that `render()` [must return a single node](https://facebook.github.io/react/tips/maximum-number-of-jsx-root-nodes.html). Returning multiple won't work!

T> [HyperScript](https://github.com/dominictarr/hyperscript) can be an interesting alternative to JSX. It provides a JavaScript based API and as such is a little closer to the metal. If you are interested, you can use the syntax with React through [hyperscript-helpers](https://www.npmjs.com/package/hyperscript-helpers).

T> There is a semantic difference between React components, such as the one above, and React elements. In the example each of those JSX nodes would be converted into one. In short, components can have state whereas elements are simpler by nature. They are just pure objects. Dan Abramov goes into further detail in a [blog post](https://facebook.github.io/react/blog/2015/12/18/react-components-elements-and-instances.html) of his.

## Setting Up the Project

To make it easier to get started, I've set up a simple Webpack based boilerplate that allows us to dig into React straight away. The boilerplate includes a development mode with a feature known as *hot loading* enabled.

Hot loading allows Webpack to patch the code running in the browser without a full refresh. It works the best especially with styling although React supports it fairly well too.

Unfortunately it's not a fool proof technology and it won't be able to detect all changes made to the code. This means there will be times when you need to force a hard refresh to make the browser to catch the recent changes.

### Setting Up Node.js and Git

To get started, make sure you have fresh versions of [Node.js](https://nodejs.org) and [Git](https://git-scm.com/) installed. I recommend using at least the LTS version of Node.js. You might run into hard to debug issues with older versions. Same can apply to versions newer than LTS because of their bleeding edge status.

T> One interesting option is to manage your environment through [Vagrant](https://www.vagrantup.com/) or a tool like [nvm](https://www.npmjs.com/package/nvm).

### Downloading the Boilerplate

In order to fetch the boilerplate our project needs, clone it through Git as follows at your terminal:

```bash
git clone https://github.com/survivejs/react-boilerplate.git kanban-app
```

This will create a new directory, *kanban-app*. Inside it you can find everything we need to get ahead. There's a small seed application that shows `Hello World!` and basic Webpack configuration. To get the seed application running, execute

```bash
npm install
```

After waiting a while, upon completion you should see `node_modules/` directory with the project dependencies.

### Running the Project

To get the project running, execute `npm start`. You should see something like this at the terminal if everything went right:

```bash
> webpack-dev-server

[webpack-validator] Config is valid.
http://localhost:8080/
webpack result is served from /
content is served from .../kanban-app
404s will fallback to /index.html
Child html-webpack-plugin for "index.html":

webpack: bundle is now VALID.
```

In case you received an error, make sure there isn't something else running in the same port. You can run the application through some other port easily using an invocation such as `PORT=3000 npm start` (Unix only). The configuration will pick up the new port from the environment. If you want to fix the port to something specific, adjust its value at *webpack.config.js*.

Assuming everything went fine, you should see something like this at the browser:

![Hello world](images/hello_01.png)

You can try modifying the source to see how hot loading works. I'll discuss the boilerplate in greater detail next so you know how it works. I'll also cover the language features we are going to use briefly.

T> In case you want to start with a fresh Git history, this would be a good point to remove `.git` directory (`rm -rf .git`) and initialize the project again (`git init && git add . && git commit -am "Initial commit"`).

T> The techniques used by the boilerplate are covered in greater detail at [SurviveJS - Webpack](http://survivejs.com/webpack/introduction/).

### Boilerplate npm `scripts`

Our boilerplate is able to generate a production grade build with hashing. There's also a deployment related target so that you can show your project to other people through [GitHub Pages](https://pages.github.com/). I've listed all of the `scripts` below:

* `npm run start` (or `npm start`) - Starts the project in the development mode. Surf to `localhost:8080` in your browser to see it running.
* `npm run build` - Generates a production build below `build/`. You can open the generated *index.html* through the browser to examine the result.
* `npm run deploy` - Deploys the contents of `build/` to the *gh-pages* branch of your project and pushes it to GitHub. You can access the project below `<user/organization name>.github.io/<project name>` after that. Before this can work correctly, you should set `publicName` at *webpack.config.js* to match your project name on GitHub.
* `npm run stats` - Generates statistics (*stats.json*) about the project. You can [analyze the build output](http://survivejs.com/webpack/building-with-webpack/analyzing-build-statistics/) further.
* `npm run test` (or `npm test`) - Executes project tests. The *Testing React* chapter digs deeper into the topic. In fact, writing tests against your components can be a good way to learn to understand React better.
* `npm run test:tdd` - Executes project tests in TDD mode. This means it will watch for changes and run the tests when changes are detected allowing you to develop fast without having to run the tests manually.
* `npm run test:lint` - Executes ESLint against the code. ESLint is able to catch smaller issues. You can even configure your development environment to work with it. This allows you to catch potential mistakes as you make them.

Study *package.json* to understand better how each of these works. There is quite a bit configuration. Again, see [SurviveJS - Webpack](http://survivejs.com/webpack/introduction/) to dig deeper into the topic.

### Boilerplate Language Features

![Babel](images/babel.png)

The boilerplate relies on a transpiler known as [Babel](https://babeljs.io/). It allows us to use features from the future of JavaScript. It transforms your code to a format understandable by the browsers. You can even use it to develop your own language features. It supports JSX through a plugin.

Babel provides support for certain [experimental features](https://babeljs.io/docs/plugins/#stage-x-experimental-presets-) from ES7 beyond standard ES6. Some of these might make it to the core language while some might be dropped altogether. The language proposals have been categorized within stages:

* **Stage 0** - Strawman
* **Stage 1** - Proposal
* **Stage 2** - Draft
* **Stage 3** - Candidate
* **Stage 4** - Finished

I would be very careful with **stage 0** features. The problem is that if the feature changes or gets removed you will end up with broken code and will need to rewrite it. In smaller experimental projects it may be worth the risk, though.

In addition to standard ES2015 and JSX, we'll be using a few custom features in this project. I've listed them below. See also the *Language Features* appendix to learn more.

* [Property initializers](https://github.com/jeffmo/es-class-static-properties-and-fields) - Example: `renderNote = (note) => {`. This binds the `renderNote` method to instances automatically. The feature makes more sense as we get to use it.
* [Decorators](https://github.com/wycats/javascript-decorators) - Example: `@DragDropContext(HTML5Backend)`. These annotations allow us to attach functionality to classes and their methods.
* [Object rest/spread](https://github.com/sebmarkbage/ecmascript-rest-spread) - Example: ``const {a, b, ...props} = this.props`. This syntax allows us to easily extract specific properties from an object.

In order to make it easier to set up the features, I created [a specific preset](https://github.com/survivejs/babel-preset-survivejs-kanban). It also contains [babel-plugin-transform-object-assign](https://www.npmjs.com/package/babel-plugin-transform-object-assign) and [babel-plugin-array-includes](https://www.npmjs.com/package/babel-plugin-array-includes) plugins. The former allows us to use `Object.assign` while the latter provides `Array.includes` without having to worry about shimming these for older environments.

A preset is simply a npm module exporting Babel configuration. Maintaining presets like this can be useful especially if you want to share the same set of functionality across multiple projects.

T> You can [try out Babel online](https://babeljs.io/repl/) to see what kind of code it generates.

T> If you are interested in a lighter alternative, check out [Bublé](https://gitlab.com/Rich-Harris/buble).

## Conclusion

Now that we have a rough understanding of what React is about and got a simple "Hello World!" application running, we can focus on development. Developing and getting into a trouble is a good way to learn after all.
