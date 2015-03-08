# Deploying apps

- XXX: explain what CommonsChunkPlugin is and why it is used here
- XXX: discuss hashing here!!! we can do cache inline, no need for a separate section perhaps
- XXX: how about other optimize plugins http://webpack.github.io/docs/list-of-plugins.html#optimize does uglify give some definite advantage here?
- XXX: you’ll probably want to include sourcemaps in the production build (better error output) http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
- XXX: we can also mention ngMinPlugin
- XXX: AppCachePlugin - i haven’t used this but perhaps worth mentioning https://github.com/lettertwo/appcache-webpack-plugin

example of uglify -> minified version!

```
    plugins: [
        //new webpack.optimize.DedupePlugin(), optional (experimental) but can help with bundle size
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
        }),
    ],
```

XXX: should we do some sample bundle size comparisons? numbers are always good as they give some more concrete idea of the differences. ie non-minified vs. minified vs. various cases (single bundle vs. multiple)
