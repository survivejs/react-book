# Building Kanban

Now that we have a nice Kanban application up and running we can worry about showing it the public. The goal of this chapter is to set up a nice production grade build. There are various techniques we can apply to bring the bundle size down. We can also leverage browser caching.

## Setting Up a Build Target

In our current setup we serve the application through `webpack-dev-server` always. In order to get a build done, we'll need to extend *package.json* `scripts` section.

**package.json**

```json
{
  ...
  "scripts": {
    "build": "webpack",
    ...
  },
  ...
}
```

We'll also need some build specific configuration to make webpack pick up our JSX. We can set up sourcemaps while at it. I'll be using `source-map` option here as that's a good pick for production.

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['babel?stage=1'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    }
  });
}
```

After these changes `npm run build` should yield the following:

```bash
> TARGET=build webpack

Hash: bd3b549c6c712233167f
Version: webpack 1.10.1
Time: 4903ms
        Asset       Size  Chunks             Chunk Names
    bundle.js    1.09 MB       0  [emitted]  main
bundle.js.map    1.28 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 345 hidden modules
```

1.09 MB is quite a lot. We should do something about that.

## Optimizing Build Size

There are a couple of basic things we can do to slim down our build. We can apply some minification to it. We can also tell React to optimize itself. Doing both will result in significant size savings. Provided we apply gzip compression on the content when serving it, further gains may be made.

### Minification

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes this can break code as it can rewrite pieces of code you inadvertently depend upon. This is the reason why we gave explicit ids to our stores for instance.

At minimum we need to just pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your webpack configuration:

**webpack.config.js**

```javascript

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}
```

If you hit `npm run build` now, you should see better results:

```bash
> TARGET=build webpack

Hash: d3508663532b5b3565cc
Version: webpack 1.10.1
Time: 12221ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     324 kB       0  [emitted]  main
bundle.js.map    2.66 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 345 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about but may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

### `process.env.NODE_ENV`

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get built in an optimized manner. This will disable some checks (i.e. property type checks) but it will give you a smaller build and improved performance.

In webpack terms you can add the following snippet to the `plugins` section of your configuration like this:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // This affects react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      ...
    ]
  });
}
```

This is a useful technique for your own code. If you have a section of code that evaluates as `false` after this process, the minifier will remove it from build completely. You can attach debugging specific utilities and such to your code easily this way. For instance you could build a powerful logging system just for development. Here's a small example of what that could look like:

```javascript
if(process.env.NODE_ENV !== 'production') {
  console.log('developing like an ace');
}
```

T> That `JSON.stringify` is needed as webpack will perform string replace "as is". In this case we'll want to end up with strings as that's what various comparisons expect, not just `production`. Latter would just cause an error. An alternative would be to use a string such as `'"production"'`. Note the "'s.

Hit `npm run build` again and you should see improved results:

```bash
> TARGET=build webpack

Hash: 37ebe639517bfeb72ff6
Version: webpack 1.10.1
Time: 10930ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     264 kB       0  [emitted]  main
bundle.js.map    2.53 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 339 hidden modules
```

So we went from 1.09 MB to 324 kB and finally to 264 kB. The final build is a little faster than the previous one. As that 264k can be served gzipped, it is quite reasonable. gzipping will drop around another 40% is well supported by browsers.

We can do a little better, though. We can split `app` and `vendor` bundles and add hashes to their filenames.

### Splitting `app` and `vendor` Bundles

The main advantage of splitting the application into two separate bundles is that it allows us to benefit from client caching. We might for instance make most of our changes to the small `app` bundle. In this case the client would have to fetch only it provided `vendor` bundle has been loaded already. This scheme won't load as fast as a single bundle initially due to the extra request but caching more than makes up for this disadvantage.

In webpack terms we will expand `entry` configuration and then use `CommonsChunkPlugin` to extract the vendor bundle. The configuration below shows how this will work out in our case.

**webpack.config.js**

```javascript
...

var pkg = require('./package.json');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    entry: {
      app: path.resolve(ROOT_PATH, 'app/main.jsx'),
      vendor: Object.keys(pkg.dependencies)
    },
    output: {
      path: path.resolve(ROOT_PATH, 'build'),
      filename: 'app.[chunkhash].js'
    },
    devtool: 'source-map',
    module: {
      ...
    }
    plugins: [
      new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        'vendor.[chunkhash].js'
      ),
      ...
    ]
  });
}
```

If you run `npm run build` now, you should see output like this:

```bash
> TARGET=build webpack

Hash: 1671be044a8a34b58fa8
Version: webpack 1.10.1
Time: 11983ms
                             Asset       Size  Chunks             Chunk Names
       app.cfd412c37a844a41daf8.js    57.8 kB       0  [emitted]  app
    vendor.edaf1006b1f4b71898f9.js     208 kB       1  [emitted]  vendor
   app.cfd412c37a844a41daf8.js.map     415 kB       0  [emitted]  app
vendor.edaf1006b1f4b71898f9.js.map    2.12 MB       1  [emitted]  vendor
                        index.html  266 bytes          [emitted]
   [0] multi vendor 64 bytes {1} [built]
    + 339 hidden modules
```

Note how small `app` bundle is in comparison. If we update the application now and deploy it, the users that have used it before will have to reload only 57.8 kB. Not bad.

One more way to push the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Cleaning Build

Our current setup doesn't clean `build` directory between builds. As this is annoying especially when hashes are used, we can set up a plugin to clean the directory for us. Execute

> npm i clean-webpack-plugin --save-dev

to install the plugin. Change the build configuration as below to integrate it.

**webpack.config.js**

```javascript
...
var Clean = require('clean-webpack-plugin');

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      new Clean(['build']),
      ...
    ]
  });
}
```

After this change our `build` directory should remain nice and tidy while building.

Note that you can provide `context` parameter to `Clean`. That allows you to execute the process in some other directory. Example `new Clean(['build'], '<context path>')`.

T> An alternatively would be to use your terminal fu (`rm -rf build/`) and set that up at the `scripts` of `package.json`.

## Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration it has been inlined to JavaScript! Even though this can be convenient during development it doesn't sound ideal. The current solution doesn't allow us to cache CSS and in some cases we might suffer from flash of unstyled content (FOUC).

As it happens webpack provides means to generate a separate CSS bundle. We can achieve this using `ExtractTextPlugin`. It comes with some overhead during complication phase and won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production usage that won't be a problem.

It will take some configuration to make it work. Hit

> npm i extract-text-webpack-plugin --save-dev

to get started. Next we need to get rid of our current css related declaration at `common` configuration and split it up between `build` and `dev` configuration sections as below.

**webpack.config.js**

```javascript
...
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var pkg = require('./package.json');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: path.resolve(ROOT_PATH, 'app/main.jsx'),
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Kanban app'
    })
  ]
};

if(TARGET === 'start') {
  module.exports = merge(common, {
    ...
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: path.resolve(ROOT_PATH, 'app')
        },
        ...
      ]
    },
    ...
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: path.resolve(ROOT_PATH, 'app')
        },
        ...
      ]
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      ...
    ]
  });
}
```

Using this setup we can still benefit from HMR during development. For production build we generate a separate CSS. `html-webpack-plugin` will pick it up automatically and inject into our `index.html`.

After running `npm run build` you should see the following output:

```bash
> TARGET=build webpack

Hash: 27584124a5659a941eea
Version: webpack 1.10.5
Time: 10589ms
                             Asset       Size  Chunks             Chunk Names
       app.4a3890cdb2f12f6bd4d5.js    54.3 kB       0  [emitted]  app
    vendor.876083b45225c03d8a74.js     208 kB       1  [emitted]  vendor
                        styles.css  557 bytes       0  [emitted]  app
   app.4a3890cdb2f12f6bd4d5.js.map     389 kB       0  [emitted]  app
                    styles.css.map   87 bytes       0  [emitted]  app
vendor.876083b45225c03d8a74.js.map    2.12 MB       1  [emitted]  vendor
                        index.html  317 bytes          [emitted]
   [0] multi vendor 64 bytes {1} [built]
    + 339 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

This means we have separate app and vendor bundles. In addition, styles have been pushed to a separate file. And top this we have sourcemaps and an automatically generated *index.html*. Not bad.

## Isomorphic Rendering

One of the interesting aspects of React is the fact that it allows so called isomorphic rendering. This means you can render static HTML through it. Once the JavaScript code gets run, it will pick up the markup. Even though this sounds trivial there are some nice advantages to this approach:

* Web crawlers will be able to access the content easier (potentially better SEO)
* You can avoid requests to fetch initial data. Especially on slow connections this can make a big difference.
* The browser doesn't have to wait for JavaScript to get evaluated. Instead it gets to render HTML straight away.
* Even users without JavaScript enabled see something. In this case it doesn't matter a lot but otherwise it could be a big factor.

Even though we don't have a proper backend in our project this is a powerful approach you should be aware of. The same idea can be applied for other scenarios such as rendering a JSX template to a PDF invoice for instance. React isn't limited to the web.

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

This template is based on the default one used by *HtmlWebpackPlugin*. It relies on a templating library known as [blueimp-tpl](https://www.npmjs.com/package/blueimp-tmpl). That's why you see all those `{% ... %}` entries there. We will inject some syntax of our own at `<div id="app">%app%</div>` next and let *HtmlWebpackPlugin* deal with the rest.

As we'll be relying on JSX when rendering, we need to rename *webpack.config.js* as *webpack.config.babel.js* first. That way webpack knows to process it through Babel and everything will work as we expect. Besides this we need to make *HtmlWebpackPlugin* aware of our template and add our custom rendering logic there.

**webpack.config.babel.js**

```javascript
var fs = require('fs');
var React = require('react');
...

var App = require('./app/components/App.jsx');
var pkg = require('./package.json');

var TARGET = process.env.npm_lifecycle_event;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: path.resolve(ROOT_PATH, 'app/main.jsx'),
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  }
};

if(TARGET === 'start') {
  module.exports = merge(common, {
    ...
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlwebpackPlugin({
        title: 'Kanban app'
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
        title: 'Kanban app',
        templateContent: renderJSX(
          fs.readFileSync(path.join(__dirname, 'templates/index.tpl'), 'utf8'),
          {
            app: React.renderToString(<App />)
          })
      })
    ]
  });
}

function renderJSX(template, replacements) {
  return function(templateParams, compilation) {
    return template.replace(/%(\w*)%/g, function(match) {
      var key = match.slice(1, -1);

      return replacements[key] ? replacements[key] : match;
    });
  }
}
```

As it doesn't make sense to use isomorphic rendering for development, I set it up only for production usage. It performs a regular expression based string replacement trick to render our React code to `%app%`. `React.renderToString` returns the markup we need.

T> If you want output that doesn't have React keys, use `React.renderToStaticMarkup` instead. This is useful especially if you are writing static site generators and want just static output.

In addition we need to tweak the entry point of our application to take these changes in count. When in production it should use the existing markup instead of injecting its own.

**app/main.jsx**

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

If you hit `npm run build` now and wait for a while, you should end up with `build/index.html` that contains something familiar. `npm start` should work the same way as earlier.

In this case isomorphic rendering doesn't yield us much. If we had a backend the situation would be different. We could serve the user markup that has initial data and enjoy the benefits. Now it's more of a gimmick but given it's a useful technique to know, you should understand the basic approach now.

## Conclusion

Our Kanban application is now ready to be served. We went from a chunky build to a slim one. Even better the production version can benefit from caching and it is able to invalidate it. When it comes to webpack this is just a small part of what you can do with it. I discuss more approaches at **Deploying applications** chapter.
