# Building Kanban

Now that we have a nice Kanban application up and running, we can worry about showing it to the public. The goal of this chapter is to set up a nice production grade build. There are various techniques we can apply to bring the bundle size down. We can also leverage browser caching.

## Optimizing Build Size

If you run `npm run build`, you can see we have a problem:

```bash
Hash: 5bfffbb0fa155e542e54
Version: webpack 1.12.9
Time: 3942ms
     Asset       Size  Chunks             Chunk Names
 bundle.js    1.11 MB       0  [emitted]  main
index.html  184 bytes          [emitted]
    + 335 hidden modules
```

1.11 MB is a lot! There are a couple of basic things we can do to slim down our build. We can apply some minification to it. We can also tell React to optimize itself. Doing both will result in significant size savings. Provided we apply gzip compression on the content when serving it, further gains may be made.

### Minification

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes this can break code as it can rewrite pieces of code you inadvertently depend upon. This is the reason why we gave explicit ids to our stores for instance.

The easiest way to enable minification is to call `webpack -p` (`-p` as in `production`). As Uglify will output a lot of warnings and they don't provide value in this case, we'll be disabling them. Add the following section to your Webpack configuration:

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
Hash: 1bffa047f9e011ffec9e
Version: webpack 1.12.9
Time: 11611ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     369 kB       0  [emitted]  main
index.html  184 bytes          [emitted]
    + 335 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about, but it may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

### `process.env.NODE_ENV`

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get built in an optimized manner. This will disable some checks (e.g., property type checks). Most importantly it will give you a smaller build and improved performance.

In Webpack terms, you can add the following snippet to the `plugins` section of your configuration:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      // Setting DefinePlugin affects React library size!
leanpub-start-insert
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
leanpub-end-insert
      ...
    ]
  });
}
```

This is a useful technique for your own code. If you have a section of code that evaluates as `false` after this process, the minifier will remove it from the build completely.

T> It can be useful to set `'process.env.NODE_ENV': JSON.stringify('development')` for your development target to force it to build in *development* environment no matter what.

You can attach debugging specific utilities and such to your code easily this way. For instance, you could build a powerful logging system just for development. Here's a small example of what that could look like:

```javascript
if(process.env.NODE_ENV === 'development') {
  console.log('developing like an ace');
}
```

If you prefer something more terse, you could use `__DEV__ === 'dev'` kind of syntax instead.

T> That `JSON.stringify` is needed, as Webpack will perform string replace "as is". In this case, we'll want to end up with strings, as that's what various comparisons expect, not just `production`. The latter would just cause an error. An alternative would be to use a string such as `'"production"'`. Note the double quotation marks (").

Trigger `npm run build` again, and you should see improved results:

```bash
Hash: e1bfa33bee94613aa056
Version: webpack 1.12.9
Time: 12118ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     308 kB       0  [emitted]  main
index.html  184 bytes          [emitted]
    + 331 hidden modules
```

So we went from 1.11 MB to 369 kB, and finally to 308 kB. The final build is a little faster than the previous one. As that 308 kB can be served gzipped, it is quite reasonable. gzipping will drop around another 40%. It is well supported by browsers.

We can do a little better, though. We can split `app` and `vendor` bundles and add hashes to their filenames.

## Splitting `app` and `vendor` Bundles

The main advantage of splitting the application into two separate bundles is that it allows us to benefit from client caching. We might, for instance, make most of our changes to the small `app` bundle. In this case, the client would have to fetch only the `app` bundle, assuming the `vendor` bundle has already been loaded.

This scheme won't load as fast as a single bundle initially due to the extra request. Thanks to client-side caching, we might not need to reload all the data for every request. This is particularly true if a bundle remains unchanged. If only `app` updates, only that may need to be downloaded.

### Defining a `vendor` Entry Point

To get started, we need to define a `vendor` entry point:

**webpack.config.js**

```javascript
var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');

// Load *package.json* so we can use `dependencies` from there
leanpub-start-insert
var pkg = require('./package.json');
leanpub-end-insert

...

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
    // Define entry points needed for splitting
leanpub-start-delete
    entry: PATHS.app,
leanpub-end-delete
leanpub-start-insert
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
    ...
  });
}
```

This tells Webpack that we want a separate *entry chunk* for our project `vendor` level dependencies. Beyond this, it's possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure](https://webpack.github.io/docs/code-splitting.html).

If you trigger the build now using `npm run build`, you should see something along this:

```bash
Hash: a8786a63540b666d4c79
Version: webpack 1.12.9
Time: 15238ms
     Asset       Size  Chunks             Chunk Names
    app.js     308 kB       0  [emitted]  app
 vendor.js     285 kB       1  [emitted]  vendor
index.html  224 bytes          [emitted]
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

Now we have separate *app*  and *vendor* bundles. There's something wrong, however. If you examine the files, you'll see that *app.js* contains *vendor* dependencies. We need to do something to tell Webpack to avoid this situation. This is where `CommonsChunkPlugin` comes in.

### Setting Up `CommonsChunkPlugin`

`CommonsChunkPlugin` allows us to extract the code we need for the `vendor` bundle. In addition we will use it to extract a *manifest*. It is a file that tells Webpack how to map each module to each file. We will need this in the next step for setting up long term caching. Here's the setup:

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      // Extract vendor and manifest files
leanpub-start-insert
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
Hash: cba1a0f89306672fcb84
Version: webpack 1.12.9
Time: 10215ms
      Asset       Size  Chunks             Chunk Names
     app.js    23.4 kB    0, 2  [emitted]  app
  vendor.js     285 kB    1, 2  [emitted]  vendor
manifest.js  743 bytes       2  [emitted]  manifest
 index.html  269 bytes          [emitted]
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to filenames.

### Adding Hashes to Filenames

Webpack provides placeholders that can be used to access different types of hashes and entry name as we saw before. The most useful ones are:

* `[name]` - Returns entry name.
* `[hash]` - Returns build hash.
* `[chunkhash]` - Returns a chunk specific hash.

Using these placeholders you could end up with filenames such as:

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
    ...
leanpub-start-insert
    output: {
      path: PATHS.build,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js'
    },
leanpub-end-insert
    ...
  });
}
```

If you execute `npm run build` now, you should see output like this.

```bash
Hash: 26d0bad7e1449769f991
Version: webpack 1.12.9
Time: 10444ms
                           Asset       Size  Chunks             Chunk Names
     app.27af6d97c50b7f0396f4.js    23.4 kB    0, 2  [emitted]  app
  vendor.a40ac075146c6d42fee6.js     285 kB    1, 2  [emitted]  vendor
manifest.13e1cf0a9dac1a1dc06c.js  763 bytes       2  [emitted]  manifest
                      index.html  332 bytes          [emitted]
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
```

Our files have neat hashes now. To prove that it works, you could try altering *app/index.jsx* and include a `console.log` there. After you build, only `app` and `manifest` related bundles should change.

One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Cleaning the Build

Our current setup doesn't clean the `build` directory between builds. As this can get annoying if we change our setup, we can use a plugin to clean the directory for us. Execute

```bash
npm i clean-webpack-plugin --save-dev
```

to install the plugin. Change the build configuration as follows to integrate it:

**webpack.config.js**

```javascript
...
leanpub-start-insert
var Clean = require('clean-webpack-plugin');
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

After this change our `build` directory should remain nice and tidy when building. See [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) for further options.

T> An alternative would be to use your terminal (`rm -rf ./build/`) and set that up in the `scripts` section of *package.json*.

## Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal. The current solution doesn't allow us to cache CSS. In some cases we might suffer from a flash of unstyled content (FOUC).

It just so happens that Webpack provides a means to generate a separate CSS bundle. We can achieve this using the `ExtractTextPlugin`. It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

It will take some configuration to make it work. Execute

```bash
npm i extract-text-webpack-plugin --save-dev
```

to get started. Next we need to get rid of our current CSS related declaration at `common` configuration. After that, we need to split it up between `build` and `dev` configuration sections as follows:

**webpack.config.js**

```javascript
...
leanpub-start-insert
var ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-end-insert

...

const common = {
  entry: PATHS.app,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      // Remove CSS specific section here
leanpub-start-delete
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: PATHS.app
      },
leanpub-end-delete
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

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    ...
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
    ...
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    devtool: 'source-map',
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
      new Clean(['build']),
leanpub-start-insert
      // Output extracted CSS to a file
      new ExtractTextPlugin('styles.[chunkhash].css'),
leanpub-end-insert
      ...
    ]
  });
}
```

Using this setup we can still benefit from the HMR during development. For a production build, we generate a separate CSS. `html-webpack-plugin` will pick it up automatically and inject it into our `index.html`.

W> Definitions such as `loaders: [ExtractTextPlugin.extract('style', 'css')]` won't work and will cause the build to error instead! So when using `ExtractTextPlugin`, use the `loader` form instead.

W> If you want to pass more loaders to the `ExtractTextPlugin`, you should use `!` syntax. Example: `ExtractTextPlugin.extract('style', 'css!autoprefixer-loader')`.

After running `npm run build` you should see output similar to the following:

```bash
Hash: f1363b0a7cba349f27da
Version: webpack 1.12.9
Time: 10685ms
                           Asset       Size  Chunks             Chunk Names
     app.1cd836fc567231771b7c.js    18.8 kB    0, 2  [emitted]  app
  vendor.a40ac075146c6d42fee6.js     285 kB    1, 2  [emitted]  vendor
manifest.67b5fd3ec07787a2e55c.js  763 bytes       2  [emitted]  manifest
 styles.1cd836fc567231771b7c.css  878 bytes    0, 2  [emitted]  app
                      index.html  404 bytes          [emitted]
   [0] multi vendor 112 bytes {1} [built]
    + 331 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have CSS related section set up!

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundles have become slightly smaller. If we modify only our CSS now, those bundles shouldn't become invalidated anymore.

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
    "deploy": "node ./lib/deploy.js",
leanpub-end-insert
    ...
  },
  ...
}
```

In order to get access to our build path, we need to expose something useful for `deploy` case. We can match for the case like this so we get useful configuration:

**webpack.config.js**

```javascript
...

leanpub-start-delete
if(TARGET === 'build' || TARGET === 'stats') {
leanpub-end-delete
leanpub-start-insert
if(TARGET === 'build' || TARGET === 'stats' || TARGET === 'deploy') {
leanpub-end-insert
  ...
}

...
```

To glue it all together, we need a deployment script like this:

**lib/deploy.js**

```javascript
var ghpages = require('gh-pages');
var config = require('../webpack.config');

main();

function main() {
  ghpages.publish(config.output.path, console.error.bind(console));
}
```

If you trigger `npm run deploy` now and everything goes fine, you should have your application hosted through GitHub Pages. You should find it at `https://<name>.github.io/<project>` (*github.com/<name>/<project>* at GitHub) assuming it worked.

## Conclusion

Beyond the features discussed, Webpack allows you to [lazy load](https://webpack.github.io/docs/code-splitting.html) content through `require.ensure`. This is handy if you happen to have a specific dependency on some view and want to load it when you need it.

Our Kanban application is now ready to be served. We went from a chunky build to a slim one. Even better the production version can benefit from caching and it is able to invalidate it.

If you wanted to develop the project further, it could be a good idea to rethink the project structure. There are [multiple ways](https://reactjsnews.com/structuring-react-projects/) to achieve this. You should be pragmatic about structuring. I believe the right structure for a given project depends on the stage it is in. You should evolve the structure as the project grows and develops.

T> It can be a good idea to read the *Authoring Libraries* chapter for more ideas on how to improve your project. Although the chapter has been designed libraries in mind, understanding the fundamentals of npm doesn't hurt. A lot of the same concepts apply to both applications and libraries after all.
