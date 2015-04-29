# Kanban Style

Traditionally web pages have been split up in markup (ie. HTML), styling (ie. CSS) and logic (ie. JavaScript). Even though it looks like an simple abstraction, there are some interesting overlaps. You can push some logic to CSS but how much is too much? Is the separation actually useful for application development? These become big questions particularly in React context. As a result some interesting solutions have appeared although the scene is still in flux.

## Old Skool Styling

So far our approach to styling has been simple. We have just sprinkled some classes around and hoped for the best.

### Webpack Configuration for Vanilla CSS

Webpack configuration has been something minimal as well:

**app/config/index.js**

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

**config/index.js**

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

exports.build = mergeConfig({
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

exports.develop = mergeConfig({
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

## react-style etc.

TODO

## Conclusion

TODO
