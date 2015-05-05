# Kanban Style

Traditionally web pages have been split up in markup (ie. HTML), styling (ie. CSS) and logic (ie. JavaScript). Even though it looks like an simple abstraction, there are some interesting overlaps. You can push some logic to CSS but how much is too much? Is the separation actually useful for application development? These become big questions particularly in React context. As a result some interesting solutions have appeared although the scene is still in flux.

## Old Skool Styling

So far our approach to styling has been simple. We have just sprinkled some classes around and hoped for the best.

### Webpack Configuration for Vanilla CSS

Webpack configuration has been something minimal as well:

**webpack.config.js**

```javascript
var common = {
  ...
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
      }
    ]
  },
};
```

To recap first [css-loader](https://www.npmjs.com/package/css-loader) goes through possible `@import` and `url()` statements within the matched files and treats them as regular `require`. This allows us to rely on various other loaders such as [file-loader](https://www.npmjs.com/package/file-loader) or [url-loader](https://www.npmjs.com/package/url-loader).

file-loader generates files whereas url-loader can create inline data urls for small resources. This can be useful for optimizing application loading as you avoid unnecessary requests while providing a slightly bigger payload. Small improvements such as this can yield large benefits especially if you are depending on a large amount of small resources within your style definitions.

### Basic Style for Kanban

To give our application slightly nicer outlook, we can try some old skool CSS tricks:

**app/stylesheets/main.css**

```css
body {
  background: cornsilk;

  font-family: sans-serif;
}
```

First we make sure the font we are using doesn't have serifs. It's not a big tweak to make but improves things already.

**app/stylesheets/lane.css**

```css
.lane {
  margin: 1em;

  border: 1px solid #ccc;
  border-radius: 0.5em;

  min-width: 10em;

  display: inline-block;
  vertical-align: top;

  background-color: #efefef;
}

.lane-header {
  padding: 1em;

  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;

  overflow: auto;

  color: #efefef;
  background-color: #333;
}

.lane-name {
  float: left;
}

.lane-add-note {
  float: right;
}
```

Next we orient our lanes in a row by utilizing `display: inline-block` property. We also make sure alignment, margin and padding work. There is also subtle rounding to give the lanes a less blockish look.

**app/stylesheets/note.css**

```css
.notes {
  margin: 0.5em;

  padding-left: 0;

  list-style: none;
}

.note {
  margin-bottom: 0.25em;

  padding: 0.5em;

  border: 1px solid #ddd;

  background-color: #fdfdfd;
}
```

For notes it's enough just to replace some of that default list styling. We also make notes visually separate from the lanes by applying color and shape.

**app/main.jsx**

```javascript
'use strict';
import './stylesheets/main.css';
import './stylesheets/lane.css';
import './stylesheets/note.css';

...
```

Finally we make sure our application takes the new declarations in count. You could argue that each component could deal with the import by itself but this is one way to go. It makes testing components easier as you don't have to worry about the import in other environments.

If we use lazy loading for our components, it may make sense to move `require` on component level. The lazy loading machinery will be able to benefit from that. As a result the initial CSS your user has to load will be smaller.

### Pros and Cons

This approach is simple and probably enough for our application. What happens when the application starts to grow and new concepts get added? Broad CSS selectors are like globals. The problem gets even worse if you have to deal with loading order. If selectors end up in a tie, the last declaration wins. Unless there's `!important` somewhere and so on. It gets complex very fast.

We could battle this problem by making the selectors more specific, using some naming rules and so on but where to draw the line? There are various alternative approaches you can consider.

## Generating a Separate Bundle for CSS

The current approach works well for simple cases. It simply inlines the CSS as a part of our JavaScript bundle. Although this can be performant (one less request), easy to set up and compiles fast, it may not be ideal always.

We cannot for instance leverage caching for our CSS. If only JavaScript portion changes all CSS will be loaded still. As our CSS is injected through JavaScript, there is additional overhead. If the user isn't running JavaScript, no styling will be applied to the markup at all.

There is a plugin that allows us to work around these problems. [extract-text-webpack-plugin](https://www.npmjs.com/package/extract-text-webpack-plugin) generates a separate bundle for CSS. It comes with some overhead during compilation phase and won't work with hot module reloading (HMR). It also takes some additional setup. In our case configuration would look like this:

**webpack.config.js**

```javascript
var ExtractTextPlugin = require('extract-text-webpack-plugin');
...

var common = {
  entry: [path.join(ROOT_PATH, 'app/main.jsx')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  }
};

if(TARGET === 'build') {
  module.exports = mergeConfig({
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css')
        },
        ...
      ]
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      ...
    ],
  });
}

if(TARGET === 'dev') {
  module.exports = mergeConfig({
    ...
    module: {
      ...
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
        },
        ...
      ]
    },
    ...
  });
}
```

Using this set up we can still benefit from HMR during development. For production build we generate a separate CSS. In order to take that CSS in count, we'll need to refer to it from `index.html`.

**build/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>
    ...
  </body>
</html>
```

After this change we should have all the benefits of a separate CSS file with a tiny configuration and performance overhead.

## Linting CSS

As we saw earlier linting can be powerful. It points out potential problems before they escalate into real issues. [csslint](https://www.npmjs.com/package/csslint) allows us to lint CSS. [csslint-loader](https://www.npmjs.com/package/csslint-loader) makes it possible to integrate it into our project. To get started hit `npm i csslint csslint-loader --save-dev`.

Next we'll need to integrate it with our configuration:

**webpack.config.js**

```javascript
...

if(TARGET === 'dev') {
  module.exports = mergeConfig({
    entry: ['webpack/hot/dev-server'],
    module: {
      preLoaders: [
        {
          test: /\.css$/,
          loader: 'csslint',
        },
        ...
      ],
      ...
    },
    ...
  });
}
```

To keep things nice and tidy I put it into the `preLoaders` section of configuration.

**.csslintrc**

```json
{
  "adjoining-classes": false,
  "box-sizing": false,
  "box-model": false,
  "compatible-vendor-prefixes": false,
  "floats": false,
  "font-sizes": false,
  "gradients": false,
  "important": false,
  "known-properties": false,
  "outline-none": false,
  "qualified-headings": false,
  "regex-selectors": false,
  "shorthand": false,
  "text-indent": false,
  "unique-headings": false,
  "universal-selector": false,
  "unqualified-attributes": false
}
```

I decided to use a set of rules from Twitter Bootstrap. These seem like a good starting point.

**package.json**

```json
"scripts": {
  ...
  "lint": "npm run lint-js && npm run lint-css",
  "lint-js": "eslint . --ext .js --ext .jsx",
  "lint-css": "csslint app/stylesheets --quiet"
},
```

If you hit `npm run lint-css` now, you should see some output, hopefully without errors. That `--quiet` flag is there to keep the tool silent unless there are errors.

Thanks to the Webpack configuration we did, you should get output during `npm run dev` process as well. In addition you should consider setting up csslint with your editor. That way you get more integrated development experience.

## CSS Methodologies

Coming up with de facto rules for styling might work a while. Over longer term as your codebase grows, you might start to experience challenges with that. As a result various methodologies have appeared in which people have taken these concerns in count.

Particularly [OOCSS](http://oocss.org/) (Object-Oriented CSS), [SMACSS](https://smacss.com/) (Scalable and Modular Approach for CSS) and [BEM](https://en.bem.info/method/) (Block Element Modifier) are well known. Each comes with its set of conventions. They can help to structure your CSS development.

Maintaining long class names BEM requires can be boring. Various libraries have appeared to make this easier. Examples of these are [react-bem-helper](https://www.npmjs.com/package/react-bem-helper), [react-bem-render](https://www.npmjs.com/package/react-bem-render) and [bem-react](https://www.npmjs.com/package/bem-react). As of writing no such libraries exist for OOCSS and SMACSS.

## cssnext, Less, Sass

The problem with vanilla CSS is that it is missing some functionality that would improve maintainability. For instance from a programmer's perspective it could be nice to have basic features such as variables, math functions, color manipulation functions and so on. Better yet it would be nice if it was possible to forget about browser specific prefixes.

### cssnext

As it happens these features are in the future. [cssnext](https://cssnext.github.io/) is a project that allows us to experience future now. There are some restrictions but it may be worth a go. In Webpack it is simply a matter of installing [cssnext-loader](https://www.npmjs.com/package/cssnext-loader) and attaching it to your CSS configuration. In our case you would end up with the following:

```javascript
{
  test: /\.css$/,
  loaders: ['style', 'css', 'cssnext'],
}
```

The advantage of this approach is that you will literally be coding in the future. As browsers get better and adopt the standards, you don't have to worry about porting.

If that sounds a little much or you are just interested in a particular feature such as autoprefixing, you can check out [autoprefixer-loader](https://www.npmjs.com/package/autoprefixer-loader) and [postcss-loader](https://www.npmjs.com/package/postcss-loader). cssnext relies on postcss. It provides you more granular level of control of CSS plugins. You can even implement your own using a bit of JavaScript.

### Less

Less is a popular CSS preprocessor that implements functionality we talked about and comes with a syntax of its own. In Webpack using Less doesn't take a lot of effort. [less-loader](https://www.npmjs.com/package/less-loader) deals with the heavy lifting:

```javascript
{
  test: /\.less$/,
  loaders: ['style', 'css', 'less'],
}
```

There is also support for Less plugins, sourcemaps and so on but to understand how those work you should check out the project itself.

### Sass

Sass is a popular alternative to Less. You should use [sass-loader](https://www.npmjs.com/package/sass-loader) with it. Remember to install `node-sass` to your project as the loader has a peer dependency on that. Webpack configuration is light again:

```javascript
{
  test: /\.scss$/,
  loaders: ['style', 'css', 'sass'],
}
```

Check out the loader for more advanced usage.

### Pros and Cons

Compared to vanilla CSS preprocessors bring a lot to the table. They deal with certain annoyances (ie. autoprefixing) and provide useful features. Particularly cssnext and postcss seem future proof alternatives to me. That said, I can see value in other preprocessors as they are established and well understood projects.

In our project we could benefit from cssnext even if we didn't make any changes to our CSS. Thanks to autoprefixing rounded corners of our lanes would look good even in legacy browsers. In addition we could parametrize styling thanks to variables.

## React Based Approaches

With React we have some additional alternatives. What if the way we've been thinking about styling has been misguided? CSS is powerful but it can become an unmaintainable mess without some discipline. Where to draw the line between CSS and JavaScript?

There are various approaches for React that allow us to push styling to component level. It may sound heretical. React, being an iconoclast, may lead the way here.

### Inline Styles to Rescue

Ironically the way solutions based on React solve this is through inline styles. Getting rid of inline styles was one of the main reasons for using separate CSS files in the first place. Now we are back there.

This means that instead of something like

```javascript
render(props, context) {
  var notes = this.props.notes;

  return (
    <ul className='notes'>{notes.map((note, i) =>
      ...
    )}</ul>
  );
}
```

and accompanying CSS, we'll do something like this:

```javascript
render(props, context) {
  var notes = this.props.notes;
  var style = {
    margin: '0.5em',
    paddingLeft: 0,
    listStyle: 'none',
  };

  return (
    <ul style={style}>{notes.map((note, i) =>
      ...
    )}</ul>
  );
}
```

Just like with HTML attribute names, we are using the same camelcase convention for CSS properties.

Note that now that we have styling at component level we can implement logic touching it easily. One classic way to do this has been to alter class name based on the outlook we want. Now we can adjust the properties we want directly.

We have lost something in process. Now all of our styling is tied to our JavaScript code. It is going to be difficult to perform large, sweeping changes to our codebase as we need to tweak a lot of components to achieve that.

We can try to work against this by injecting a part of styling through props. A component could provide patch its style based on provided one. This can be improved further by coming up with conventions that allow parts of style configuration mapped to some specific part. We just reinvented selectors on a small scale.

How about things like media queries? This naive approach won't quite cut it. Fortunately people have come up with libraries to solve these tough problems for us.

### Radium

As of writing [Radium](http://projects.formidablelabs.com/radium/) doesn't support ES6 style classes yet because it injects certain key functionality through mixins. It does have certain valuable ideas that are worth covering, however. Most importantly it provides abstractions required to deal with media queries, browser states (ie. `:hover`) and modifiers (primary/secondary button and so on).

It expands the basic syntax as follows:

```javascript
var style = {
  // general styles
  padding: '1em',
  // :hover, :focus etc.
  states: [
    {
      hover: {
        border: '1px solid black'
      }
    },
  ],
  // kind='<type>' properties map to these
  modifiers: [
    {
      kind: {
        primary: {
          background: 'green'
        },
        warning: {
          background: 'yellow'
        }
      }
    }
  ],
  // media queries
  '@media (min-width: 800px)': {
    width: '100%',

    ':hover': {
      background: 'white'
    }
  }
};
```

### React Style

[React Style](https://github.com/js-next/react-style) uses the same syntax as React Native [StyleSheet](https://facebook.github.io/react-native/docs/stylesheet.html#content). It expands the basic definition by introducing additional keys for fragments.

```javascript
var StyleSheet = import 'react-style';

var styles = StyleSheet.create({
  primary: {
    background: 'green'
  },
  warning: {
    background: 'yellow'
  },
  button: {
    padding: '1em'
  },
  // media queries
  '@media (min-width: 800px)': {
      button: {
        width: '100%'
      }
  }
});

...

<button styles={[styles.button, styles.primary]}>Confirm</button>
```

As you can see we can use individual fragments to get the same effect as Radium modifiers. Also media queries are supported. React Style expects that you browser states (ie. `:hover` and such) through JavaScript. Also CSS animations won't work. Instead it's preferred to use some other solution for that.

Interestingly there is a [React Style plugin for Webpack](https://github.com/js-next/react-style-webpack-plugin). It can extract CSS declarations into a separate bundle. Now we are closer to the world we're used to but without cascades. We also have our style declarations on component level.

### React Inline

[React Inline](https://github.com/martinandert/react-inline) is an interesting twist on StyleSheet. It generates CSS based on `className` prop of elements where it is used. The example above could be adapted to React Inline like this:

```javascript
import cx from 'classnames';
...

class ConfirmButton extends React.Component {
  render() {
    const {className} = this.props;
    const classes = cx(styles.button, styles.primary, className);

    return <button className={classes}>Confirm</button>;
  }
}
```

Unlike React Style, the approach supports browser states (ie. `:hover` etc.). Unfortunately it relies on its own custom tooling to generate React code and CSS it needs to work. As of yet there's no Webpack loader available.

### jsxstyle

Pete Hunt's [jsxstyle](https://github.com/petehunt/jsxstyle) aims to mitigate some problems of React Style's approach. As you saw in previous examples we still have style definitions separate from the component markup. jsxstyle merges these two concepts. Consider the following example:

```javascript
// PrimaryButton component
<button
  padding='1em'
  background='green'
>Confirm</button>
```

The approach is still in its early days. For instance support for media queries is missing. Instead of defining modifiers as above, you'll end up defining more components to support your use cases.

Just like React Style, also jsxstyle comes with a Webpack loader that can extract CSS into a separate file.

## Conclusion

It is simple to try out various styling approaches with Webpack. You can do it all ranging from vanilla CSS to more complex setups. React specific tooling even comes with loaders of their own. This makes it easy to try out different alternatives.

React based styling approaches allow us to push styles to component level. This provides an interesting contract to conventional approaches where CSS is kept separate. Dealing with component specific logic becomes easier. You will lose some power provided by CSS but in return you gain something that is simpler to understand and harder to break.

It is likely possible to combine various approaches to some extent. Perhaps you could keep high level styling on old skool CSS while on component level you would do something more fitting. There are no best practices yet and we are still figuring out the best ways to do this in React.
