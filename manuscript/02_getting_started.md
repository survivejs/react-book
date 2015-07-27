# Getting Started

If you are not one of those guys that likes to skip introductions, you might have some clue what webpack is. In its simplicity it is a module bundler. It takes a bunch of assets in and outputs assets you can give to your client.

This sounds very simple but in practice it can be a very complicated and messy process. You definitely don't want to deal with all the details yourself. This is where webpack fits in. Next we'll get webpack set up and your first project running.

## Setting Up Your First Project

Webpack is one of those tools that depends on [Node.js](http://nodejs.org/). Make sure you have it installed and you can have `npm` available at your terminal. Next you should set a directory for your project, navigate there, hit `npm init` and fill in some details. You can just hit `return` for each and it will work. Here are the commands in detail:

```bash
mkdir kanban_app
cd kanban_app
npm init
# hit return a few times till you have gone through the questions
```

As a result you should have `package.json`. If you are into version control, as you should, this would be a good time to set up your repository. You can create commits as you progress with the project.

## Installing webpack

Next you should get webpack installed. We'll do a local install and save it as a project dependency. This will allow us to maintain webpack's version per project. In addition you can invoke the build in other environments easily this way. Hit `npm i webpack node-libs-browser --save-dev`.

T> `node-libs-browser` is installed as it is a peer dependency of webpack. Starting from npm 3 it won't get installed automatically so it's a good idea to have it installed in order to be future-proof.

This is a good change to try to run webpack for the first time. Hit `node_modules/.bin/webpack`. You should see a version print, link to cli guide and a long list of options. We won't be using most of those but it's good to know that this tool is packed with functionality if nothing else.

Webpack works using a global install as well (`-g` or `--global` flag during installation) but it is preferred to keep it as a project dependency like this. The arrangement helps to keep your life simpler as you have direct control over the version you are running.

T> We are using `--save-dev` here instead of `--save` as we want to use webpack as a development dependency. Use `--save-dev` for parts you need to generate your distribution version. Otherwise `--save` is a good choice. This will give us more semantic `package.json` and makes our lives easier as we need to get back to the project later.

## Directory Structure

As projects with just `package.json` are very boring, we should set up something more concrete. Let's do a little web site that loads some JavaScript which we build using webpack. Set up a structure like this:

- /app
  - main.js
  - component.js
- /build
  - bundle.js (automatically generated, no need to create this)
  - index.html
- package.json
- webpack.config.js

In this case we'll generate `bundle.js` using webpack based on our `/app`. To make this possible, let's set up `webpack.config.js` and those other files.

### Creating webpack Configuration

To expand on the structure above we'll want to convert *app/main.js* into *build/bundle.js*. In webpack terms this would translate to a configuration like this:

**webpack.config.js**

```javascript
var path = require('path');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: [
    path.resolve(ROOT_PATH, 'app/main'),
  ],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js'
  }
};
```

We use `path.resolve` here as it is preferred to use absolute paths with webpack. If you move your configuration below some directory, you'll need to take this into account. Alternatively you could use `path.join(__dirname, 'app', 'main')` and such but I like to use `path.resolve` for these.

## Running Your First Build

Now that we have basic configuration in place, we'll need something to build. Let's start with a classic `Hello World` type of app. Set up `/app` like this:

**app/component.js**

```javascript
module.exports = function () {
  var element = document.createElement('h1');

  element.innerHTML = 'Hello world';

  return element;
};
```

**app/main.js**

```javascript
var component = require('./component');
var app = document.createElement('div');

document.body.appendChild(app);

app.appendChild(component());
```

Now run `node_modules/.bin/webpack` in your terminal. If everything went fine, you should see something similar at your terminal as below:

```bash
> webpack_demo@1.0.0 build /Users/something/projects/webpack_demo
> webpack

Hash: e02f97146a15a8a5c3a9
Version: webpack 1.8.4
Time: 44ms
    Asset     Size  Chunks             Chunk Names
bundle.js  1.74 kB       0  [emitted]  main
   [0] ./app/main.js 115 bytes {0} [built]
   [1] ./app/component.js 134 bytes {0} [built]
```

Congratulations! You have just created your first webpack bundle.

## Setting Up Entry Point

In order to actually use our bundle, we'll need to define the last missing bit, *index.html*. Here's a starting point:

**build/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <script src="build/bundle.js"></script>
  </body>
</html>
```

We simply just point at the bundle via *script* `src`, nothing more than that. You can now serve the file through a web server or load it directly through a browser. You should see something familiar there. One easy way to achieve this is to install `serve` (`npm i serve -g`) and hit `serve` within the `build` directory.

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

## Conclusion

Getting a simple build like this done isn't very complex. In the end you'll end up with a little bit of configuration. Webpack deals with the nasty details for you after that. We are close to unleashing the power of webpack here as you will soon see.

Hitting `npm run build` all the time and refreshing browser during development doesn't sound that efficient. In the next chapter we'll solve this issue and get more serious configuration done.
