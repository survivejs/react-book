# Developing with Webpack

In `Getting Started` we set up a minimal Webpack based build. Hitting `npm run build` all the time will get boring eventually. In addition refreshing browser manually is annoying. We can get rid of both of these problems if we do a bit more configuration work.

## Setting Up `webpack-dev-server`

As a first step, hit `npm i webpack-dev-server --save-dev` at project root. This will add Webpack development server we'll be relying upon.

In addition we'll need to tweak `package.json` *scripts* section to include it. Here's the basic idea:

**package.json**

```json
{
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --config webpack.development.js --devtool eval --progress --colors --content-base build"
  }
}
```

When you run `npm run dev` from your terminal it will execute the command stated as a value on the **dev** property. This is what it does:

1. `webpack-dev-server` - Starts a web service on `localhost:8080`
2. `--config webpack.development.js` - Points at custom development configuration we'll set up later
3. `--devtool eval` - Creates source urls for your code. Making you able to pinpoint by filename and line number where any errors are thrown
4. `--progress` - Will show progress of bundling your application
5. `--colors` - Yay, colors in the terminal!
6. `--content-base build` - Points to the output directory configured

To recap, when you run `npm run dev` this will fire up the webservice, watch for file changes and automatically rebundle your application when any file changes occur. How neat is that!

Go to **http://localhost:8080** and you should see something.

> If you want to use some other port than 8080, you can pass `--port` parameter (ie. `--port 4000`) to *webpack-dev-server*.

## Automatic Browser Refresh

When **webpack-dev-server** is running it will watch your files for changes. When that happens it rebundles your project and notifies browsers listening to refresh. To trigger this behavior you need to change your *index.html* file in the `build/` folder.

**build/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <script src="http://localhost:8080/webpack-dev-server.js"></script>
    <script src="bundle.js"></script>
  </body>
</html>
```

We added a script that refreshes the application when a change occurs.

You will also need to add an entry point to your configuration. Here's `webpack.development.js` that will work:

```javascript
var path = require('path');

module.exports = {
    entry: ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
};
```

Thats it! Now your application will automatically refresh whenever a file changes. This also gives us automatic CSS updates with a bit of effort. Webpack manages to do this without a refresh. Let's see how to achieve that next.

## Default Environment

In the example above we created our own *index.html* file to give more freedom and control. If you don't need a lot of control and just want something simple that works, Webpack provides a default one. We can run the application from **http://localhost:8080/webpack-dev-server/bundle** instead of root.

Compared to our simple setup, it provides an iframe showing a status bar that indicates the status of the rebundling process. You can also examine your browser log for the same information and possible errors.

## CSS Refresh

In order to load CSS to project, we'll need to use a couple of loaders. To get started, invoke `npm i css-loader style-loader --save-dev`. *css-loader* will resolve `@import` and `url` statements of our CSS files. *style-loader* allows us to `require` specific CSS files at our JavaScript. Similar approach works with CSS preprocessors. You'll likely find some loader for them and configure in the same way.

Now that we have the loaders we need, we'll need to make sure Webpack is aware of them. It's time to configure.

```javascript
var path = require('path');

module.exports = {
    entry: ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
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
```

The configuration we added simply tells Webpack that whenever it meets some file ending with `css` it should invoke the power of loaders in this specific order. Note that loaders are evaluated from right to left. So first it will pass a possible CSS file to *css-loader* and to *style-loader* after that.

We are missing just one bit, the actual CSS itself. Define *app/main.css* with contents like this:

```css
body {
    background: navy;
}
```

In addition we'll need to make Webpack aware of this file. Insert `require('./main.css')` statement to the beginning of *app/main.js*. Finally, hit `npm run dev` and point your browser to *localhost:8080* provided you are using the default port.

To see the magic in action, you should open up *app/main.css* and change the background color to something nice like `lime` (`background: lime`). Develop styles as needed.

In order to make our normal build (`npm run build`) work with CSS, you could attach that *module* bit to `webpack.config.js` too. Given it can be cumbersome to maintain configuration like this, I'll show you a nicer way.

## Sharing Common Configuration

As duplication in source is the mother of all mistakes, it can make sense adopt approaches that allow us to avoid that. Given Webpack configuration is just JavaScript, there are multiple ways to approach the problem. As long as we generate the structure Webpack expects, we should be fine.

One way to do this is to keep configuration within a single file and expose it from there via small wrappers for Webpack to consume. The advantage of this approach is that you can see all the bits and pieces and how they relate to each other from single place. The wrappers cause a little bit of extra work but it's not a bad price to pay for some clarity.

We can adapt this approach to our project quite easily. First of all let's set up a structure like this:

- /config
  - index.js - This is where the configuration goes
  - build.js - Build configuration exposed to Webpack
  - develop.js - Development configuration exposed to Webpack

Those *build.js* and *develop.js* simply point at our *index.js*. To give you an idea, they can simply look like this:

**config/build.js**

```javascript
module.exports = require('./').build; // develop for the other
```

Our *index.js* is more complex as it will have to contain all of our configuration. In this case something like this would do just fine:

**config/index.js**

```javascript
var path = require('path');

var ROOT_PATH = path.resolve(__dirname, '..');

var common = {
    entry: [path.join(ROOT_PATH, 'app/main.js')],
    output: {
        path: path.resolve(ROOT_PATH, 'build'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ['style', 'css']
            }
        ]
    },
};

exports.build = common;

exports.develop = {
    entry: common.entry.concat(['webpack/hot/dev-server']),
    output: common.output,
    module: common.module,
};
```

The common configuration has been separated to a section of its own. In this case `build` configuration is actually the same as `common` configuration. We do a little tweak for `develop` case. As you can see the configuration is quite easy to follow this way.

To make everything work again, we'll need to tweak our `package.json` **scripts** section like this:

```json
{
  "scripts": {
    "build": "webpack --config config/build",
    "dev": "webpack-dev-server --config config/develop --devtool eval --progress --colors --hot --content-base build"
  }
}
```

You can also eliminate those old configuration files at the project root while at it.

If everything went fine, the old commands should work still. Now we have something a little tidier together that's possible to grow even further with minimal work.

## Conclusion

In this chapter you learned how to go beyond a basic Webpack configuration. Webpack's development server is a powerful feature that has even more in store. We'll get back to that when we discuss hot module reloading and React in the next chapter.
