# Building Kanban

Now that we have a nice Kanban application up and running, we can worry about showing it to the public. The goal of this chapter is to set up a nice production grade build. There are various techniques we can apply to bring the bundle size down. We can also leverage browser caching.

## Optimizing Build Size

If you run `npm run build`, you can see we have a problem:

```bash
> webpack

Hash: 1d6630b6a72d918bb24b
Version: webpack 1.12.11
Time: 3964ms
    Asset     Size  Chunks             Chunk Names
bundle.js  1.11 MB       0  [emitted]  main
    + 335 hidden modules
```

1.11 MB is a lot! There are a couple of basic things we can do to slim down our build. We can apply some minification to it. We can also tell React to optimize itself. Doing both will result in significant size savings. Provided we apply gzip compression on the content when serving it, further gains may be made.

### Minification

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes, this can break code as it can rewrite pieces of code you inadvertently depend upon. This is the reason why we gave explicit ids to our stores for instance.

The easiest way to enable minification is to call `webpack -p` (`-p` as in `production`). Alternatively we an use a plugin directly as this provides us more control. By default Uglify will output a lot of warnings and they don't provide value in this case, we'll be disabling them. Add the following section to your Webpack configuration:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
leanpub-start-delete
  module.exports = merge(common, {});
leanpub-end-delete
leanpub-start-insert
  module.exports = merge(common, {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
leanpub-end-insert
}
```

T> Uglify warnings can help you to understand how it processes the code. Therefore it may be beneficial to have a peek at the output every once in a while.

If you trigger `npm run build` now, you should see better results:

```bash
> webpack

Hash: 9f52871e77451f9d6f29
Version: webpack 1.12.11
Time: 10342ms
    Asset    Size  Chunks             Chunk Names
bundle.js  366 kB       0  [emitted]  main
    + 335 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about, but it may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

### Setting `process.env.NODE_ENV`

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get built in an optimized manner. This will disable some checks (e.g., property type checks). Most importantly it will give you a smaller build and improved performance.

In Webpack terms, you can add the following snippet to the `plugins` section of your configuration:

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    plugins: [
leanpub-start-insert
      // Setting DefinePlugin affects React library size!
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')

        // You can set this to JSON.stringify('development') for your
        // development target to force NODE_ENV to development mode
        // no matter what
      }),
leanpub-end-insert
      ...
    ]
  });
}
```

This is a useful technique for your own code. If you have a section of code that evaluates as `false` after this process, the minifier will remove it from the build completely.

T> That `JSON.stringify` is needed, as Webpack will perform string replace "as is". In this case, we'll want to end up with strings, as that's what various comparisons expect, not just `production`. The latter would just cause an error. An alternative would be to use a string, such as `'"production"'`. Note the double quotation marks (").

Trigger `npm run build` again, and you should see improved results:

```bash
> webpack

Hash: a08756deaf3ac92da810
Version: webpack 1.12.11
Time: 8936ms
    Asset    Size  Chunks             Chunk Names
bundle.js  306 kB       0  [emitted]  main
    + 331 hidden modules
```

So we went from 1.11 MB to 367 kB, and finally, to 306 kB. The final build is a little faster than the previous one. As that 306 kB can be served gzipped, it is quite reasonable. gzipping will drop around another 40%. It is well supported by browsers.

We can do a little better, though. We can split `app` and `vendor` bundles and add hashes to their filenames.

T> [babel-plugin-transform-inline-environment-variables](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables) Babel plugin can be used to achieve the same effect. See [the official documentation](https://babeljs.io/docs/plugins/transform-inline-environment-variables/) for details.

## Splitting `app` and `vendor` Bundles

The main advantage of splitting the application into two separate bundles is that it allows us to benefit from client caching. We might, for instance, make most of our changes to the small `app` bundle. In this case, the client would have to fetch only the `app` bundle, assuming the `vendor` bundle has already been loaded.

This scheme won't load as fast as a single bundle initially due to the extra request. Thanks to client-side caching, we might not need to reload all the data for every request. This is particularly true if a bundle remains unchanged. If only `app` updates, only that may need to be downloaded.

### Defining a `vendor` Entry Point

While developing the application, we made sure to separate our `dependencies` and `devDependencies`. This split will come in handy now. It allows us to push `dependencies` to a bundle of its own. It is very important you don't have any development related bits, such as Webpack, in that definition as then the build won't work as you might expect.

To get started, we need to define a `vendor` entry point. Given *alt-utils* is problematic for this kind of setup, I've simply excluded it from the `vendor` bundle. You can use a similar idea with other problematic dependencies. Here's the setup:

**webpack.config.js**

```javascript
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');

leanpub-start-insert
// Load *package.json* so we can use `dependencies` from there
const pkg = require('./package.json');
leanpub-end-insert

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

process.env.BABEL_ENV = TARGET;

const common = {
  entry: PATHS.app,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
leanpub-start-delete
    filename: 'bundle.js'
leanpub-end-delete
leanpub-start-insert
    // Output using entry name
    filename: '[name].js'
leanpub-end-insert
  },
  ...
};

if(TARGET === 'build') {
  module.exports = merge(common, {
leanpub-start-insert
    // Define entry points needed for splitting
    entry: {
      app: PATHS.app,
      vendor: Object.keys(pkg.dependencies).filter(function(v) {
        // Exclude alt-utils as it won't work with this setup
        // due to the way the package has been designed
        // (no package.json main).
        return v !== 'alt-utils';
      })
    },
leanpub-end-insert
    plugins: [
      ...
    ]
  });
}
```

This tells Webpack that we want a separate *entry chunk* for our project `vendor` level dependencies.

Beyond this, it's possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure](https://webpack.github.io/docs/code-splitting.html).

If you trigger the build now using `npm run build`, you should see something along this:

```bash
> webpack

Hash: 4cebe8ce0c6daca5cfa1
Version: webpack 1.12.11
Time: 13510ms
    Asset    Size  Chunks             Chunk Names
   app.js  306 kB       0  [emitted]  app
vendor.js  285 kB       1  [emitted]  vendor
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

Now we have separate *app*  and *vendor* bundles. There's something wrong, however. If you examine the files, you'll see that *app.js* contains *vendor* dependencies. We need to do something to tell Webpack to avoid this situation. This is where `CommonsChunkPlugin` comes in.

### Setting Up `CommonsChunkPlugin`

`CommonsChunkPlugin` allows us to extract the code we need for the `vendor` bundle. In addition, we will use it to extract a *manifest*. It is a file that tells Webpack how to map each module to each file. We will need this in the next step for setting up long term caching. Here's the setup:

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    // Define entry points needed for splitting
    entry: {
      ...
    }
    plugins: [
leanpub-start-insert
      // Extract vendor and manifest files
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
leanpub-end-insert
      ...
    ]
  });
}
```

If you run `npm run build` now, you should see output as below:

```bash
> webpack

Hash: 1a18381bce0dd20fe684
Version: webpack 1.12.11
Time: 8630ms
      Asset       Size  Chunks             Chunk Names
     app.js    20.7 kB    0, 2  [emitted]  app
  vendor.js     285 kB    1, 2  [emitted]  vendor
manifest.js  743 bytes       2  [emitted]  manifest
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to filenames.

### Adding Hashes to Filenames

Webpack provides placeholders that can be used to access different types of hashes and entry name as we saw before. The most useful ones are:

* `[name]` - Returns entry name.
* `[hash]` - Returns build hash.
* `[chunkhash]` - Returns a chunk specific hash.

Using these placeholders you could end up with filenames, such as:

```bash
app.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

If the file contents are different, the hash will change as well, thus invalidating the cache, or more accurately the browser will send a new request for the new file. This means if only `app` bundle gets updated, only that file needs to be requested again.

T> An alternative way to achieve the same would be to generate static filenames and invalidate the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark will invalidate the cache. This method is not recommended. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is a more performant way to go.

We can use the placeholder idea within our configuration like this:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    // Define entry points needed for splitting
    entry: {
      ...
    }
leanpub-start-insert
    output: {
      path: PATHS.build,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js'
    },
leanpub-end-insert
    plugins: [
      ...
    ]
  });
}
```

If you execute `npm run build` now, you should see output like this.

```bash
> webpack

Hash: 1bedf99d8ce4cab9ca1b
Version: webpack 1.12.11
Time: 9871ms
                           Asset       Size  Chunks             Chunk Names
     app.76f47b014429236ae8de.js    20.7 kB    0, 2  [emitted]  app
  vendor.8727ee8bd7a21ec7e1fb.js     285 kB    1, 2  [emitted]  vendor
manifest.3abf3112b70cde9b4d49.js  763 bytes       2  [emitted]  manifest
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

Our files have neat hashes now. To prove that it works, you could try altering *app/index.jsx* and include a `console.log` there. After you build, only `app` and `manifest` related bundles should change.

One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Generating *index.html* through *html-webpack-plugin*

Even though we have fine bundles now, there's one problem. Our current *index.html* doesn't point to them correctly. We could write the script tags we need by hand, but fortunately there are better ways. One option would be to trigger Webpack through its [Node.js API](https://webpack.github.io/docs/node.js-api.html). The build output its API provides contains the asset names we need. After that we could apply those to some template.

A good alternative is to use a Webpack plugin and a template that have been designed for this purpose. [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) and [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) work well together and can perform a lot of the heavy lifting for us. Install them first:

```bash
npm i html-webpack-plugin html-webpack-template --save-dev
```

In order to connect it with out project, we need to tweak the configuration a notch. While at it, get rid of *build/index.html* as we won't need that anymore. The system will generate it for us after this step:

**webpack.config.js**

```javascript
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
leanpub-start-insert
const HtmlWebpackPlugin = require('html-webpack-plugin');
leanpub-end-insert

...

const common = {
  ...
  module: {
    ...
leanpub-start-delete
  },
leanpub-end-delete
leanpub-start-insert
  }
  plugins: [
    new HtmlWebpackPlugin({
      template: 'node_modules/html-webpack-template/index.ejs',
      title: 'Kanban app',
      appMountId: 'app',
      inject: false
    })
  ]
leanpub-end-insert
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
leanpub-start-delete
      contentBase: PATHS.build,
leanpub-end-delete

      ...
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

...
```

If you trigger `npm run build` now, the output should include *index.html*:

```bash
> webpack

Hash: 1bedf99d8ce4cab9ca1b
Version: webpack 1.12.11
Time: 10203ms
                           Asset       Size  Chunks             Chunk Names
     app.76f47b014429236ae8de.js    20.7 kB    0, 2  [emitted]  app
  vendor.8727ee8bd7a21ec7e1fb.js     285 kB    1, 2  [emitted]  vendor
manifest.3abf3112b70cde9b4d49.js  763 bytes       2  [emitted]  manifest
                      index.html  643 bytes          [emitted]
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

Even though this adds some configuration to our project, we don't have to worry about gluing things together now. If more flexibility is needed, it's possible to implement a custom template.

## Cleaning the Build

Our current setup doesn't clean the `build` directory between builds. As this can get annoying if we change our setup, we can use a plugin to clean the directory for us. Install the plugin first:

```bash
npm i clean-webpack-plugin --save-dev
```

Change the build configuration as follows to integrate it:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const Clean = require('clean-webpack-plugin');
leanpub-end-insert

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
leanpub-start-insert
      new Clean([PATHS.build]),
leanpub-end-insert
      ...
    ]
  });
}
```

After this change, our `build` directory should remain nice and tidy when building. See [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) for further options.

T> If you want to preserve possible dotfiles within your build directory, you can use `[path.join(PATHS.build, '/*')]` instead of `[PATHS.build]`.

T> An alternative would be to use your terminal (`rm -rf ./build/`) and set that up in the `scripts` section of *package.json*.

## Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal. The current solution doesn't allow us to cache CSS. In some cases we might suffer from a flash of unstyled content (FOUC).

It just so happens that Webpack provides a means to generate a separate CSS bundle. We can achieve this using the [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

It will take some configuration to make it work. Execute

```bash
npm i extract-text-webpack-plugin --save-dev
```

to get started. Next, we need to get rid of our current CSS related declaration at `common` configuration. After that, we need to split it up between `build` and `dev` configuration sections as follows:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-end-insert

...

const common = {
  entry: PATHS.app,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
leanpub-start-delete
      {
        // Test expects a RegExp! Note the slashes!
        test: /\.css$/,
        loaders: ['style', 'css'],
        // Include accepts either a path or an array of paths.
        include: PATHS.app
      },
leanpub-end-delete
      {
        test: /\.jsx?$/,
        loaders: ['babel?cacheDirectory'],
        include: PATHS.app
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'node_modules/html-webpack-template/index.html',
      title: 'Kanban app',
      appMountId: 'app'
    })
  ]
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      ...
    },
leanpub-start-insert
    module: {
      loaders: [
        // Define development specific CSS setup
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: PATHS.app
        }
      ]
    },
leanpub-end-insert
    plugins: [
      ...
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    output: {
      ...
    },
leanpub-start-insert
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: PATHS.app
        }
      ]
    },
leanpub-end-insert
    plugins: [
      new Clean([PATHS.build], {
        verbose: false // Don't write logs to console
      }),
leanpub-start-insert
      // Output extracted CSS to a file
      new ExtractTextPlugin('styles.[chunkhash].css'),
leanpub-end-insert
      ...
    ]
  });
}
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS. `html-webpack-plugin` will pick it up automatically and inject it into our `index.html`.

W> Definitions, such as `loaders: [ExtractTextPlugin.extract('style', 'css')]`, won't work and will cause the build to error instead! So when using `ExtractTextPlugin`, use the `loader` form instead.

W> If you want to pass more loaders to the `ExtractTextPlugin`, you should use `!` syntax. Example: `ExtractTextPlugin.extract('style', 'css!autoprefixer-loader')`.

After running `npm run build`, you should see output similar to the following:

```bash
> webpack

Hash: b6b87447300880b09594
Version: webpack 1.12.11
Time: 9250ms
                           Asset       Size  Chunks             Chunk Names
     app.ec1ff5633cd6145ca3d1.js    15.9 kB    0, 2  [emitted]  app
  vendor.226ca9faf3c5d6df7cf1.js     327 kB    1, 2  [emitted]  vendor
manifest.c638f974fe3d9ced70f4.js  763 bytes       2  [emitted]  manifest
 styles.ec1ff5633cd6145ca3d1.css  888 bytes    0, 2  [emitted]  app
                      index.html  711 bytes          [emitted]
   [0] multi vendor 136 bytes {1} [built]
    + 362 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have a CSS related section set up!

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundles have become slightly smaller. If we modify only our CSS now, those bundles shouldn't become invalidated anymore. In addition we avoid the FOUC problem.

T> If you have a complex project with a lot of dependencies, it is likely a good idea to use the `DedupePlugin`. It will find possible duplicate files and deduplicate them. Use `new webpack.optimize.DedupePlugin()` in your plugins definition to enable it.

## Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding Webpack better. We can get statistics from it easily and we can visualize them using a tool. This shows us the composition of our bundles.

In order to get suitable output we'll need to do a couple of tweaks to our configuration:

**package.json**

```json
{
  ...
  "scripts": {
leanpub-start-insert
    "stats": "webpack --profile --json > stats.json",
leanpub-end-insert
    ...
  },
  ...
}
```

**webpack.config.js**

```javascript
...

leanpub-start-delete
if(TARGET === 'build') {
leanpub-end-delete
leanpub-start-insert
if(TARGET === 'build' || TARGET === 'stats') {
leanpub-end-insert
  ...
}

...
```

If you trigger `npm run stats` now, you should find *stats.json* at your project root after it has finished processing. We can take this file and pass it to [the online tool](http://webpack.github.io/analyse/). Note that the tool works only over HTTP! If your data is sensitive, consider using [the standalone version](https://github.com/webpack/analyse) instead.

Besides helping you to understand your bundle composition, the tool can help you to optimize your output further.

W> If any Webpack plugin or loader logs something, it will most likely end up in the stats output! This is why we are setting `verbose: false` for the `Clean` plugin.

## Deployment

There's no one right way to deploy our application. `npm run build` provides us something static to host. If you drop that on a suitable server, it will just work. One neat way to deal with it for small demos is to piggyback on GitHub Pages.

### Hosting on GitHub Pages

A package known as [gh-pages](https://www.npmjs.com/package/gh-pages) allows us to achieve this easily. You point it to your build directory first. It will then pick up the contents and push them to the `gh-pages` branch. To get started, execute

```bash
npm i gh-pages --save-dev
```

We are also going to need an entry point at *package.json*:

**package.json**

```json
{
  ...
  "scripts": {
leanpub-start-insert
    "deploy": "gh-pages -d build",
leanpub-end-insert
    ...
  },
  ...
}
```

If you trigger `npm run deploy` now and everything goes fine, you should have your application hosted through GitHub Pages. You should find it at `https://<name>.github.io/<project>` (*github.com/<name>/<project>* at GitHub) assuming it worked.

T> If you need a more elaborate setup, you can use the Node.js API that *gh-pages* provides. The default CLI tool it provides is often enough, though.

## Conclusion

Beyond the features discussed, Webpack allows you to [lazy load](https://webpack.github.io/docs/code-splitting.html) content through `require.ensure`. This is handy if you happen to have a specific dependency on some view and want to load it when you need it.

Our Kanban application is now ready to be served. We went from a chunky build to a slim one. Even better the production version can benefit from caching and it is able to invalidate it.

If you wanted to develop the project further, it could be a good idea to rethink the project structure. I've discussed the topic in *Structuring React Projects* appendix. It can be beneficial to read the *Authoring Libraries* chapter for more ideas on how to improve the npm setup of your project.
