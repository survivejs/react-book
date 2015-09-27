## Isomorphic Rendering

TODO: discuss this in more detail at a blog post with a proper example.

React supports isomorphic rendering. This means you can render static HTML through it. Once the JavaScript code runs, it will pick up the HTML markup. Even though this sounds trivial, there are some nice advantages to this approach:

* Web crawlers will be able to access the content easier (potentially better SEO).
* You can avoid requests to fetch initial data. Especially on slow connections, this can make a big difference.
* The browser doesn't have to wait for JavaScript to get evaluated. Instead it gets to render HTML right away.
* Even users without JavaScript enabled can see something. In this case, it doesn't matter a lot, but otherwise it could be a big factor.

Even though we don't have a proper back-end in our project, this is a powerful approach you should be aware of. The same idea can be applied for other scenarios, such as rendering a JSX template to a PDF invoice for example. React isn't limited to the web.

We will need to perform a couple of tweaks to our project in order to enable isomorphic rendering. Thankfully *HtmlWebpackPlugin* can do most of the work for us. We just need to implement a custom template and render our initial JSX to it. Set up *index.tpl* as follows.

**templates/index.tpl**

```html
<!DOCTYPE html>
<html{% if(o.htmlWebpackPlugin.files.manifest) { %}
  manifest="{%= o.htmlWebpackPlugin.files.manifest %}"{% } %}>
  <head>
    <meta charset="UTF-8">
    <title>{%=o.htmlWebpackPlugin.options.title%}</title>
    {% if (o.htmlWebpackPlugin.files.favicon) { %}
    <link rel="shortcut icon" href="{%=o.htmlWebpackPlugin.files.favicon%}">
    {% } %}
    {% for (var css in o.htmlWebpackPlugin.files.css) { %}
    <link href="{%=o.htmlWebpackPlugin.files.css[css] %}" rel="stylesheet">
    {% } %}
  </head>
  <body>
    <div id="app">%app%</div>

    {% for (var chunk in o.htmlWebpackPlugin.files.chunks) { %}
    <script src="{%=o.htmlWebpackPlugin.files.chunks[chunk].entry %}"></script>
    {% } %}
  </body>
</html>
```

This template is based on the default one used by *HtmlWebpackPlugin*. It relies on a templating library known as [blueimp-tpl](https://www.npmjs.com/package/blueimp-tmpl). That's why you see all those `{% ... %}` entries there. We will inject some syntax of our own in `<div id="app">%app%</div>` next, and let *HtmlWebpackPlugin* deal with the rest.

As we'll be relying on JSX when rendering, we need to rename *webpack.config.js* to *webpack.config.babel.js* first. That way Webpack knows to process it through Babel, and everything will work as we expect. Besides this we need to make *HtmlWebpackPlugin* aware of our template, and add our custom rendering logic there.

**webpack.config.babel.js**

```javascript
const fs = require('fs');
const React = require('react');
...

const App = require('./app/components/App.jsx');
const pkg = require('./package.json');

const TARGET = process.env.npm_lifecycle_event;
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'app');
const BUILD_PATH = path.resolve(ROOT_PATH, 'build');
const APP_TITLE = 'Kanban app';

const common = {
  entry: APP_PATH,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: BUILD_PATH,
    filename: 'bundle.js'
  }
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    ...
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlwebpackPlugin({
        title: APP_TITLE
      })
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      ...
      new HtmlwebpackPlugin({
        title: APP_TITLE,
        templateContent: renderTemplate(
          fs.readFileSync(path.join(__dirname, 'templates/index.tpl'), 'utf8'),
          {
            app: React.renderToString(<App />)
          })
      })
    ]
  });
}

function renderTemplate(template, replacements) {
  return function() {
    return template.replace(/%(\w*)%/g, function(match) {
      var key = match.slice(1, -1);

      return replacements[key] ? replacements[key] : match;
    });
  };
}
```

We cannot use isomorphic rendering for development in this case because the generated results and front-end state may differ. This is due to the fact that `localStorage` may contain some initial data. If you had an actual back-end to develop against and you store the data there, this wouldn't be a problem.

Our isomorphic setup performs a regular expression based replacement to render our React code to `%app%`. Alternatively we could use a templating library, such as [handlebars](https://www.npmjs.com/package/handlebars), but this solution is enough for now. Finally `React.renderToString` returns the markup we need.

T> If you want output that doesn't have React keys, use `React.renderToStaticMarkup` instead. This is useful especially if you are writing static site generators.

In addition we need to tweak the entry point of our application to take these changes into account. When in production it should use the existing markup instead of injecting its own.

**app/index.jsx**

```javascript
...

function main() {
  persist(alt, storage, 'app');

  if(process.env.NODE_ENV === 'production') {
    React.render(<App />, document.getElementById('app'));
  }
  if(process.env.NODE_ENV !== 'production') {
    const app = document.createElement('div');

    document.body.appendChild(app);

    React.render(<App />, app);
  }
}
```

The strange looking `NODE_ENV` checks are used to make sure dead code elimination kicks in when building the JavaScript. It will remove the entire branch from the eliminated code because the statement will evaluate as `false` in a static check performed by the minifier.

If you hit `npm run build` now and wait for a while, you should end up with `build/index.html` that contains something familiar. `npm start` should work the same way as earlier.

In this case, isomorphic rendering doesn't yield us much. If we had a back-end the situation would be different. We could serve the user markup that has the initial data and enjoy the benefits. Even though it's now more of a gimmick, it's a useful technique to be aware of.