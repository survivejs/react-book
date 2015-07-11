# Understanding webpack Configuration

One of the keys to understanding webpack and mastering it is to have a good idea of how its configuration works. Even though we have touched at various bits of it already, it doesn't hurt to look into it more detail.

[The official documentation](https://webpack.github.io/docs/configuration.html) covers every piece of it in case you are interested in some particular part. Here I'll go through the important parts and how they relate to each other.

## `entry` Configuration

Earlier in the book we did things like:

```javascript
var common = {
  entry: [path.resolve(ROOT_PATH, 'app/main')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  ...
};
```

Note that if we pass an array to `entry`, only the last one will be exported to `output`. All files will be loaded, though. You will see this sort of usage in various development setups for instance.

An alternative way to write this would be have configuration such as:

```javascript
{
  context: ROOT_PATH,
  entry: './app/main',
  ...
}
```

As you can see, we can manipulate the `context` of `entry`. This becomes useful especially in a more complicated configuration where we want to generate multiple bundles like this:

```javascript
{
  context: ROOT_PATH,
  entry: {
    main: './app/main',
    charts: './app/charts'
  },
  // note that context doesn't apply here!
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  },
  ...
}
```

Now webpack will be able to output a bundle for each of our entries. You can also pass an array for an individual entry. The same rule applies here as above. All files will be loaded but only the last one will be exported.

XXXXX: test this out + set up a demo. integrate into earlier material?

## `output` Configuration

TODO

## `module` Configuration

## `resolve` Configuration

## `resolveLoader` Configuration
