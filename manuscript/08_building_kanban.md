# Building Kanban

XXXXX

We simply just point at the bundle via *script* `src`, nothing more than that. You can now serve the file through a web server or load it directly through a browser. You should see something familiar there. One easy way to achieve this is to install `serve` (`npm i serve -g`) and hit `serve` within the `build` directory.

T> Note that scripts such as `start` or `test` are special cases. You can run them directly through `npm`. Normally you run these scripts through `npm run` (ie `npm run start` or `npm run build`).

## Setting Up `package.json` *scripts*

It can be useful to be able to run *build* and such commands through `npm`. That way you don't have to remember difficult incantations. This can be achieved easily by setting up a `scripts` section to `package.json`.

In this case we can move the build step behind `npm run build` by adding the following section at `package.json`:

```json
"scripts": {
  "build": "webpack"
}
```

You can either replace the current `scripts` section with the above or just add that `build` line there. To start a build, you can hit `npm run build` now.

T> npm will add webpack to `PATH` temporarily. This way we don't have to do that difficult `node_modules/.bin/webpack` thing here.

Later on this approach will become more powerful as project complexity grows. You can hide the complexity within `scripts` while keeping the interface simple.

The potential problem with this approach is that it can tie you to a Unix environment in case you use environment specific commands. If so, you may want to consider using something environment agnostic, such as [gulp-webpack](https://www.npmjs.com/package/gulp-webpack).

## Sharing Common Configuration

If we don't structure our configuration in a smart way, it will become easy to make mistakes. We'll want to avoid unnecessary duplication. Given webpack configuration is just JavaScript, there are many ways to approach the problem. As long as we generate the structure webpack expects, we should be fine.

One way to do this is to keep all configuration in `webpack.config.js` and control what it returns using an environment variable. The advantage of this approach is that you can see all the bits and pieces and how they relate to each other from single place. We can adapt this approach to our project quite easily.

In order to make it easier to deal with this arrangement I've developed a little custom merge utility known as `webpack-merge`. Install it using `npm i webpack-merge --save-dev` to your project. Compared to `merge` you might be used to this variant that concatenates arrays instead of replacing them. This is particularly useful with loader configuration. Set up **webpack.config.js** as below:

**webpack.config.js**

```javascript
var path = require('path');
var merge = require('webpack-merge');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);

var common = {
  entry: [path.resolve(ROOT_PATH, 'app/main')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  },
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
    devtool: 'source-map'
  });
}

if(TARGET === 'dev') {
  module.exports = merge(common, {
    devtool: 'eval'
  });
}
```

The common configuration has been separated to a section of its own. We use a different `devtool` depending on the target. Those `devtool` bits in the configuration define how webpack deals with sourcemaps. Setting this up gives you better debug information in browser. There are a variety of options as discussed in the [official documentation](https://webpack.github.io/docs/configuration.html#devtool). The current ones are good starting points.

To make everything work again, we'll need to tweak our `package.json` **scripts** section like this:

```json
...
"scripts": {
  "build": "TARGET=build webpack",
  "start": "TARGET=dev webpack-dev-server --progress --colors --hot --inline --history-api-fallback --content-base build"
},
...
```

W> In `"scripts"`, `TARGET=build` type of declarations won't work on Windows! You should instead use `SET TARGET=build&& webpack` and `SET TARGET=dev&& webpack-dev-server...` there. It is important it's `build&&` as `build &&` will fail. Later on webpack will allow env to be passed to it directly making this cross-platform. For now this will work.

You can also eliminate those old configuration files at the project root while at it.

If everything went fine, the old commands should work still. Now we have something a little tidier together that's possible to grow even further with minimal work.

## `html-webpack-plugin`

In our current solution both build and development rely on the same `index.html`. That will cause problems as the project expands. Instead it's preferable to use `html-webpack-plugin` for this purpose. It can generate all the references we need without us having to tweak them manually.

As a first step hit `npm i html-webpack-plugin --save-dev`. Get rid of `build/index.html`. We'll generate that dynamically next with some configuration.

**webpack.config.js**

```javascript
var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var merge = require('webpack-merge');

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

We can also drop `--content-base` from the `start` script since the entry point will get generated dynamically.

**package.json**

```json
...
"scripts": {
  "build": "TARGET=build webpack",
  "start": "TARGET=dev webpack-dev-server --progress --colors --hot --inline --history-api-fallback"
},
...
```

If you hit `npm run build` now, you should get output that's roughly equal to what we had earlier. We still need to make our development server work to get back where we started.

T> Note that you can pass a custom template to `html-webpack-plugin`. In our case the default template it uses is just fine for our purposes.

first build...

```bash
> TARGET=build webpack

Hash: a235591f70fee65ac6c6
Version: webpack 1.10.1
Time: 3718ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     653 kB       0  [emitted]  main
bundle.js.map     769 kB       0  [emitted]  main
   index.html  184 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

As you can see, the output is quite chunky! Fortunately there are a few tricks we can do about that.

## Optimizing Build Size

There are two simple things we can perform to make our build slimmer. We can apply some minification to it. We can also tell React to optimize itself. Doing both will result in significant size savings. Provided we apply gzip compression on the content when serving it, further gains may be made.

### Minification

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Fortunately we don't have to care about exact technical details.

At minimum we need to just pass `-p` parameter to `webpack`. It will give a bunch of warnings especially in React environment by default, however, so we'll enable minification using other way. Add the following section to your webpack configuration:

**webpack.config.js**

```javascript
var webpack = require('webpack');

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    devtool: 'source-map',
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

Hash: 98a618ef4d32c8627010
Version: webpack 1.10.1
Time: 6726ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     172 kB       0  [emitted]  main
bundle.js.map    1.57 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 163 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is much smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about but may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

### `process.env.NODE_ENV`

We can perform one more step to decrease build size further. React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get in an optimized manner. This will disable some checks (i.e. property type checks) but it will give you a smaller build and improved performance.

In webpack terms you can add the following snippet to the `plugins` section of your configuration like this:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // This has effect on the react lib size
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

Hash: aa14e0e6b73e3a30ad04
Version: webpack 1.10.1
Time: 6092ms
        Asset       Size  Chunks             Chunk Names
    bundle.js     123 kB       0  [emitted]  main
bundle.js.map    1.48 MB       0  [emitted]  main
   index.html  184 bytes          [emitted]
   [0] multi main 28 bytes {0} [built]
    + 158 hidden modules
```

So we went from 653k to 172k and finally to 123k. The final build is a little faster than the previous one. As that 123k can be served gzipped, it is very reasonable. As we add dependencies to the project the size will grow. Then we will have to apply some other strategies and be smarter about loading. Fortunately we can do all that with webpack when the time comes.

## Other Configuration Approaches

There is no single clear convention on how to deal with webpack configuration. Given webpack expects an object structure the way you generate it doesn't matter that much. The way you saw above is the one I find the most convenient as it allows you to share configuration easily while understanding what's going on.

Some people prefer to write a separate configuration file per target. In order to share configuration they write a factory function. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).

This approach can be taken even further. [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack) is an example of a webpack based library that wraps common scenarios within an easier to use format. When using a library like this you don't have to worry about specific configuration as much. You will lose some power in the process but sometimes that can be acceptable.

In fact webpack works well as a basis for more advanced tools. I've helped to develop a static site generator known as [Antwar](https://antwarjs.github.io/). It builds upon webpack and React and hides a lot of the complexity of webpack from the user. webpack is a good fit for tools like this as it solves so many difficult problems well.

## Conclusion

Getting a simple build like this done isn't very complex. In the end you'll end up with a little bit of configuration. Webpack deals with the nasty details for you after that. We are close to unleashing the power of webpack here as you will soon see.

Hitting `npm run build` all the time and refreshing browser during development doesn't sound that efficient. In the next chapter we'll solve this issue and get more serious configuration done.
