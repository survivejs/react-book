# Build Automation

Hitting `npm run build` all the time will get boring eventually. Refreshing browser manually is another one of those things that is annoying. We can get rid of both of these problems if we do a bit more configuration work.

## Setting Up `webpack-dev-server`

As a first step, hit `npm i webpack-dev-server --save`. In addition we'll need to tweak `package.json` *scripts* section to include it. Here's the basic idea:

*package.json*
```json
{
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --devtool eval --progress --colors --hot --content-base build"
  }
}
```

When you run `npm run dev` from your terminal it will execute the command stated as a value on the **dev** property. This is what it does:

1. `webpack-dev-server` - Starts a web service on localhost:8080
2. `--devtool eval` - Creates source urls for your code. Making you able to pinpoint by filename and line number where any errors are thrown
3. `--progress` - Will show progress of bundling your application
4. `--colors` - Yay, colors in the terminal!
5. `--content-base build` - Points to the output directory configured

To recap, when you run `npm run dev` this will fire up the webservice, watch for file changes and automatically rebundle your application when any file changes occur. How neat is that!

Go to **http://localhost:8080** and you should see something.

## Automatic Browser Refresh

When **webpack-dev-server** is running it will watch your files for changes. When that happens it rebundles your project and notifies browsers listening to refresh. To trigger this behavior you need to change your *index.html* file in the `build/` folder.

*build/index.html*
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

We added a script that refreshes the application when a change occurs. You will also need to add an entry point to your configuration:

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

Thats it! Now your application will automatically refresh on file changes.

## Default environment

In the example above we created our own *index.html* file to give more freedom and control. It is also possible to run the application from **http://localhost:8080/webpack-dev-server/bundle**. This will fire up a default *index.html* file that you do not control. It also fires this file up in an iFrame allowing for a status bar to indicate the status of the rebundling process.

> TBD: this chapter probably needs to be extended a little bit. We could delve into the details of WebpackpackDevServer etc. and build on that later.

## Automating CSS Refresh

When **webpack-dev-server** is running with [Automatic browser refresh](Automatic-browser-refresh) the CSS will also update, but a bit differently. When you do a change to a CSS file the style tag belonging to that file will be updated with the new content... without a refresh!

> TBD: expand on this
