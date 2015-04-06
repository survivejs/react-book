# Authoring Libraries

TODO: expand on http://www.nixtu.info/2015/02/how-to-publish-and-maintain-npm-packages.html

Webpack can be handy for packaging your library for general consumption. You can use it to output UMD, a format that's compatible with various module loaders (CommonJS, AMD) and globals.

## How can I output UMD for my library?

Especially if you are creating a library, it can be useful to output an UMD version of your library. This can be achieved using the following snippet:

```javascript
output: {
    path: './dist',
    filename: 'mylibrary.js',
    libraryTarget: 'umd',
    library: 'MyLibrary',
},
```

In order to avoid bundling big dependencies like React, you'll want to use a configuration like this in addition:

```javascript
externals: {
    'react/addons': 'react'
},
```

## How can I output a minified version of my library?

Here's the basic idea:

```javascript
output: {
    path: './dist',
    filename: 'awesomemular.min.js',
    libraryTarget: 'umd',
    library: 'Awesomemular',
},
plugins: [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
    }),
]
```
