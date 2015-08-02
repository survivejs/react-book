# Building Kanban

Now that we have a nice Kanban application up and running we can worry about showing it the public. If you hit `TARGET=dev node_modules/.bin/webpack` at the project root, you can get a standalone bundle like this:

```bash
Hash: df2d3b2f428017d5412d
Version: webpack 1.10.1
Time: 4428ms
     Asset       Size  Chunks             Chunk Names
 bundle.js    1.18 MB       0  [emitted]  main
index.html  184 bytes          [emitted]
    + 322 hidden modules
```

The problem is that 1.18 MB is a lot! In addition our build contains bits and pieces we don't want it to contain.

The goal of this chapter is to set up a nice production grade build. There are various techniques we can apply to bring the bundle size down. We can also leverage browser caching.

## Setting Up Build Target

Since hitting `TARGET=dev node_modules/.bin/webpack` gets boring after a while we can set up a shortcut for that. Ideally we could just hit `npm run build` and that's it. The following snippet shows how to set this up.

**package.json**

```json
{
  ...
  "scripts": {
    "build": "TARGET=build webpack",
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

Hash: b29c96842ae323c096e7
Version: webpack 1.10.1
Time: 5040ms
        Asset       Size  Chunks             Chunk Names
    bundle.js    1.08 MB       0  [emitted]  main
bundle.js.map    1.27 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 322 hidden modules
```

We actually shaved a little out of our bundle. We still have a long way to go, though.

## Optimizing Build Size

There are a couple of basic things we can do to slim down our build. We can apply some minification to it. We can also tell React to optimize itself. Doing both will result in significant size savings. Provided we apply gzip compression on the content when serving it, further gains may be made.

### Minification

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes this can break code as it can rewrite pieces of code you inadvertently depend upon. This is the reason why we gave explicit ids to our stores for instance.

At minimum we need to just pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your webpack configuration:

**webpack.config.js**

```javascript
var webpack = require('webpack');

...

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

Hash: 8cee85087249dc0588b0
Version: webpack 1.10.1
Time: 11729ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     320 kB       0  [emitted]  main
bundle.js.map    2.63 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 322 hidden modules
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

Hash: 91e74e2912c5d1643d5d
Version: webpack 1.10.1
Time: 11593ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     261 kB       0  [emitted]  main
bundle.js.map     2.5 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 316 hidden modules
```

So we went from 1.18 MB to 1.08 MB to 320 kB and finally to 261 kB. The final build is a little faster than the previous one. As that 261k can be served gzipped, it is quite reasonable. gzipping will drop around another 40% is well supported by browsers.

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
      app: path.resolve(ROOT_PATH, 'app/main'),
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

Hash: 3822f63a6706739444d2
Version: webpack 1.10.1
Time: 11715ms
                             Asset       Size  Chunks             Chunk Names
       app.7779066c5f00c5fd488c.js    53.9 kB       0  [emitted]  app
    vendor.a953e98e7c480f870363.js     208 kB       1  [emitted]  vendor
   app.7779066c5f00c5fd488c.js.map     385 kB       0  [emitted]  app
vendor.a953e98e7c480f870363.js.map    2.12 MB       1  [emitted]  vendor
                        index.html  266 bytes          [emitted]
   [0] multi vendor 64 bytes {1} [built]
    + 316 hidden modules
```

Note how small `app` bundle is in comparison. If we update the application now and deploy it, the users that have used it before will have to reload only 54 kB. Not bad.

One more way to push the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Cleaning Build

Our current setup doesn't clean `build` directory between builds. As this is annoying especially when hashes are used, we can set up a plugin to clean the directory for us. Execute

> npm i clean-webpack-plugin --save-dev`

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
  entry: path.resolve(ROOT_PATH, 'app/main'),
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
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

if(TARGET === 'dev') {
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
    }
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

Hash: 5ac4141a6a1a107c9fd2
Version: webpack 1.10.1
Time: 11538ms
                             Asset       Size  Chunks             Chunk Names
       app.49e4dc76e551e4333cb3.js    50.1 kB       0  [emitted]  app
    vendor.a953e98e7c480f870363.js     208 kB       1  [emitted]  vendor
                        styles.css  557 bytes       0  [emitted]  app
   app.49e4dc76e551e4333cb3.js.map     358 kB       0  [emitted]  app
                    styles.css.map   87 bytes       0  [emitted]  app
vendor.a953e98e7c480f870363.js.map    2.12 MB       1  [emitted]  vendor
                        index.html  317 bytes          [emitted]
   [0] multi vendor 64 bytes {1} [built]
    + 316 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

This means we have separate app and vendor bundles. In addition styles have been pushed to a separate file. And top this we have sourcemaps and an automatically generated *index.html*. Not bad.

## Conclusion

Our Kanban application is now ready to be served. We went from a chunky build to a slim one. Even better the production version can benefit from caching and it is able to invalidate it. When it comes to webpack this is just a small part of what you can do with it. I discuss more approaches at **Deploying applications** chapter.
