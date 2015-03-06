# Getting Started

If you are not one of those guys that likes to skip preface, you might have some clue what Webpack is. In its simplicity it is a module bundler. It takes a bunch of assets in and outputs assets you can give to your client. This sounds very simple but in practice it can be a very complicated and messy process. You definitely don't want to deal with all the details yourself. This is where Webpack fits in.

In this chapter we're going to help you to get Webpack set up and your first project running.

## Setting Up Your First Project

Yeah, Webpack is one of those tools that depends on Node.js. What's up with tools these days? Anyway, head to http://nodejs.org/ and get it installed unless you have done so already. You should have `npm` available at your terminal. Once you are done, continue.

Next you should set a directory for your project, navigate there, hit `npm init` and fill in some details. Here are the commands in detail:

```bash
mkdir webpack_demo
cd webpack_demo
npm init
```

As a result you should have `package.json`. If you are into version control, as you should, this would be a good time to up your repository. You can create commits as you progress with the chapter.

### Installing Webpack

Next you should get Webpack installed. We'll do a local install and save it as a project dependency. This way you can invoke the build anywhere (build server, whatnot). Run `npm i webpack --save-dev`. If you want to run the tool, hit `node_modules/.bin/webpack`.

> Webpack works using a global install as well (`-g` flag) but it is preferred to keep it as a project dependency like this. The arrangement helps to keep your life simpler as you have direct control over the version you are running.

### Directory Structure

As projects with just `package.json` are very boring, we should set up something more concrete. Let's do a little web site that loads some JavaScript which we build using Webpack. Here's a structure that works:

- /app
  - main.js
  - component.js
- /build
  - bundle.js (automatically created)
  - index.html
- package.json
- webpack.config.js

In this case we'll create `bundle.js` using Webpack based on our `/app`. To make this possible, let's set up `webpack.config.js`.

### Creating Webpack Configuration

In our case a basic configuration could look like this:

*webpack.config.js*

```javascript
var path = require('path');


module.exports = {
    entry: path.resolve(__dirname, 'app/main.js'),
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
};
```

> TODO: explain why path.resolve is needed

## Running Your First Build

Now that we have basic configuration in place, we'll need something to build. Let's start with a classic `Hello World` type of app. Set up `/app` like this:

*app/component.js*

```javascript
'use strict';


module.exports = function () {
    var element = document.createElement('h1');

    element.innerHTML = 'Hello world';

    return element;
};
```

*app/main.js*

```javascript
'use strict';
var component = require('./component.js');


document.body.appendChild(component());

```

Now run `node_modules/.bin/webpack` in your terminal and your application will be built. A *bundle.js* file will appear in your `/build` folder. Your *index.html* file in the `build/` folder will need to load up the application.

*build/index.html*

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

> It would be possible to generate this file with Webpack using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). You can give it a go if you are feeling adventurous. It is mostly a matter of configuration. Generally this is the way you work with Webpack. You figure out what you want to load, find a loader and hook it up.

## Running the Application

Just double-click the *index.html* file or set up a web server pointing to the `build/` folder.

## Setting Up `package.json` *scripts*

It can be useful to run build, serve and such commands through `npm`. That way you don't have to worry about the technology used in the project. You just invoke the commands. This can be achieved easily by setting up a `scripts` section to `package.json`.

In this case we can move the build step behind `npm run build` like this:

1. `npm i webpack --save` - If you want to install Webpack just a development dependency, you can use `--save-dev`. This is handy if you are developing a library and don't want it to depend on the tool (bad idea!).
2. Add the following to `package.json`:

```json
  "scripts": {
    "build": "webpack"
  }
```

To invoke a build, you can hit `npm run build` now. NPM will find it as `npm run` adds Webpack to the `PATH` temporarily.

Later on this approach will become more powerful as project complexity grows. You can hide the complexity within `scripts` while keeping the interface simple.

The potential problem with this approach is that it can tie you to a Unix environment in case you use environment specific commands. If so, you may want to consider using something environment agnostic, such as [gulp-webpack](https://www.npmjs.com/package/gulp-webpack).
