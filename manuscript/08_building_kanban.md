# Building Kanban

Now that we have a nice Kanban application up and running we can worry about showing it the public. If you hit `node_modules/.bin/webpack` at the project root, you can get a standalone bundle like this:

```bash
kanban_app $ node_modules/.bin/webpack
Hash: 763d2bcd3890bd3c3b33
Version: webpack 1.10.1
Time: 3997ms
    Asset    Size  Chunks             Chunk Names
bundle.js  1.1 MB       0  [emitted]  main
    + 322 hidden modules
```

The problem is that 1.1 MB is a lot! In addition our build contains bits and pieces we don't want it to contain.

The goal of this chapter is to set up a nice production grade build. There are various techniques we can apply to bring the bundle size down.

## Setting Up `package.json` *scripts*

As hitting `node_modules/.bin/webpack` is tedious, we can do something much better. We can push it behind `npm run build` with some configuration at the `scripts` section.

**package.json**

```json
{
  ...
  "scripts": {
    "build": "webpack",
    ...
  }
  ...
}
```

This works because npm will add webpack to `PATH` temporarily.  Now `npm run build` should work. You can set up little tasks like this for other purposes like linting or testing.

The potential problem with this approach is that it can tie you to a Unix environment in case you use environment specific commands. If so, you may want to consider using something environment agnostic, such as [gulp-webpack](https://www.npmjs.com/package/gulp-webpack).

T> Note that scripts such as `start` or `test` are special cases. You can run them directly through `npm`. Normally you run these scripts through `npm run` (ie `npm run start` or `npm run build`).

## Setting Up Build Configuration

We are still stuck with a big bundle even though we can generate it easily now. We will need to configure webpack in a smarter way. The idea is that we will separate configuration based on need. Given webpack configuration is just JavaScript there are multiple ways to achieve this. You could for instance split it to multiple files. Sharing common configuration is always a problem, though.

Some people prefer to write a separate configuration file per target. In order to share configuration they write a factory function. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).

This approach can be taken even further. [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack) is an example of a webpack based library that wraps common scenarios within an easier to use format. When using a library like this you don't have to worry about specific configuration as much. You will lose some power in the process but sometimes that can be acceptable.

T> Webpack works well as a basis for more advanced tools. I've helped to develop a static site generator known as [Antwar](https://antwarjs.github.io/). It builds upon webpack and React and hides a lot of the complexity of webpack from the user. webpack is a good fit for tools like this as it solves so many difficult problems well.

I have settled with a single configuration file based approach. The idea is that there's a smart `merge` function that overrides objects and concatenates arrays. This works well with webpack configuration given that's what you want to do most of the time. In this approach the configuration block to use is determined based on an environment variable.

The biggest advantage of this approach is that it allows you to see all relevant configuration at one glance. The problem is that for now there's no nice way to set environment variables through `package.json` in a cross-platform way. It is possible this problem will go away with webpack 2 as it make it possible to pass the context data through the command itself.

### Passing Build Target to Configuration

For this setup to work we need to pass `TARGET` through `package.json`. You could use standard `NODE_ENV` here but it's up to you. I don't like to mix these up. Here's what `package.json` should look like after setting build targets.

**package.json**

```json
{
  ...
  "scripts": {
    "build": "TARGET=build webpack",
    "start": "TARGET=dev webpack-dev-server --progress --colors --hot --inline --history-api-fallback --content-base build"
  },
  ...
}
```

After this change we can access `TARGET` at `webpack.config.js` through `process.env.TARGET`. This will give us branching we need.

W> `TARGET=build` type of declarations won't work on Windows! You should instead use `SET TARGET=build&& webpack` and `SET TARGET=dev&& webpack-dev-server...` there. It is important it's `build&&` as `build &&` will fail. Later on webpack will allow env to be passed to it directly making this cross-platform. For now this will work.

## Setting Up Configuration Targets

As discussed we'll be using a custom `merge` function for sharing configuration between targets. Hit `npm i webpack-merge --save-dev` to add it to the project. To get started we can add `merge` stubs to our configuration.

**webpack.config.js**

```javascript
var path = require('path');
var merge = require('webpack-merge');

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
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel?stage=1'],
        include: path.resolve(ROOT_PATH, 'app')
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  }
};

if(TARGET === 'build') {
  module.exports = merge(common, {});
}

if(TARGET === 'dev') {
  module.exports = merge(common, {});
}
```

## Separating JSX Configuration

In our current configuration both `build` and `dev` targets use hot loading. Given we don't need that for production usage, we might as well remove that from there. Expand configuration as follows.

**webpack.config.js**

```javascript
var common = {
  ...
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  }
};

if(TARGET === 'build') {
  module.exports = merge(common, {
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

if(TARGET === 'dev') {
  module.exports = merge(common, {
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel?stage=1'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    }
  });
}
```

Now production build won't contain any hot loading related code. Even though verbose, this is a good step to take.

## Setting Up Sourcemaps

In order to improve debuggability of the application we can set up sourcemaps. These allow you to get proper debug information at browser. You'll see exactly where an error was raised for instance. In webpack this is controlled through `devtool` setting. We can use decent defaults as follows:

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    devtool: 'source-map',
    ...
  });
}

if(TARGET === 'dev') {
  module.exports = merge(common, {
    devtool: 'eval',
    ...
  });
}
```

If you run the build now in either way, webpack will generate a separate file with sourcemaps. The browser will be able to pick it up through naming convention. The [official documentation](https://webpack.github.io/docs/configuration.html#devtool) goes into further detail about possible options available.

## Setting Up `html-webpack-plugin`

In our current solution both build and development rely on the same `index.html`. This is not an ideal situation. We might want to customize the production version, use hashed filenames for caching and so on. `html-webpack-plugin` was developed these goals in mind. It can generate `index.html` and the needed references within without us having to tweak them manually.

As a first step hit `npm i html-webpack-plugin --save-dev`. Get rid of `build/index.html`. We'll generate that dynamically next with some configuration.

**webpack.config.js**

```javascript
var path = require('path');
var merge = require('webpack-merge');
var HtmlwebpackPlugin = require('html-webpack-plugin');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  ...
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Kanban app'
    })
  ]
};

...
```

T> Note that you can pass a custom template to `html-webpack-plugin`. In our case the default template it uses is just fine for our purposes.

We can also drop `--content-base` from the `start` script since the entry point will get generated dynamically and hence won't be needed.

**package.json**

```json
...
"scripts": {
  "build": "TARGET=build webpack",
  "start": "TARGET=dev webpack-dev-server --progress --colors --hot --inline --history-api-fallback"
},
...
```

If you hit `npm run build` now, you should get output that's roughly equal to what we had earlier. This time, though, `index.html` gets generated for us dynamically. Development server works as expected as well. You should see output similar to this:

```bash
> TARGET=build webpack

Hash: 07d808a1da8068d5ff50
Version: webpack 1.10.1
Time: 5086ms
        Asset       Size  Chunks             Chunk Names
    bundle.js    1.08 MB       0  [emitted]  main
bundle.js.map    1.27 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
    + 322 hidden modules
```

Our build is chunky still. We should do something about that.

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

So we went from 1.08 MB to 320 kB and finally to 261 kB. The final build is a little faster than the previous one. As that 261k can be served gzipped, it is quite reasonable. gzipping will drop around another 40% is well supported by browsers.

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

Our current setup doesn't clean `build` directory between builds. As this is annoying especially when hashes are used, we can set up a plugin to clean the directory for us. Invoke `npm i clean-webpack-plugin --save-dev` to add a suitable plugin to our project. Integrating this is simple. Change the build configuration as below.

**webpack.config.js**

```javascript
...
var Clean = require('clean-webpack-plugin');


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

After this change our `build` directory should remain nice and tidy.

T> An alternatively would be to use your terminal fu (`rm -rf build/`) and set that up at the `scripts` of `package.json`.

## Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration it has been inlined to JavaScript! Even though this can be convenient during development it doesn't sound ideal. The current solution doesn't allow us to cache CSS and in some cases we might suffer from flash of unstyled content (FOUC).

As it happens webpack provides means to generate a separate CSS bundle. We can achieve this using `ExtractTextPlugin`. It comes with some overhead during complication phase and won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production usage that won't be a problem.

It will take some configuration to make it work. Hit `npm i extract-text-webpack-plugin --save-dev` to get started. Next we need to get rid of our current css related declaration at `common` configuration and split it up between `build` and `dev` configuration sections as below.

**webpack.config.js**

```javascript
...
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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
