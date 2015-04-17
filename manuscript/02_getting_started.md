# Getting Started

If you are not one of those guys that likes to skip introduction, you might have some clue what Webpack is. In its simplicity it is a module bundler. It takes a bunch of assets in and outputs assets you can give to your client. This sounds very simple but in practice it can be a very complicated and messy process. You definitely don't want to deal with all the details yourself. This is where Webpack fits in. Next we'll get Webpack set up and your first project running.

## Setting Up Your First Project

Webpack is one of those tools that depends on Node.js. Head to http://nodejs.org/ and get it installed unless you have done so already. You should have `npm` available at your terminal. Once you are done, continue.

Next you should set a directory for your project, navigate there, hit `npm init` and fill in some details. Here are the commands in detail:

```bash
mkdir kanban_app
cd kanban_app
npm init
```

As a result you should have `package.json`. If you are into version control, as you should, this would be a good time to up your repository. You can create commits as you progress with the chapter.

## Installing Webpack

Next you should get Webpack installed. We'll do a local install and save it as a project dependency. This way you can invoke the build anywhere (build server, whatnot). Run `npm i webpack --save-dev`. If you want to run the tool, hit `node_modules/.bin/webpack`.

T> We are using `--save-dev` here instead of `--save` as we want to use Webpack as a development dependency. Use `--save-dev` for parts you need to generate your distribution version. Otherwise `--save` is a good pick.

T> Webpack works using a global install as well (`-g` flag) but it is preferred to keep it as a project dependency like this. The arrangement helps to keep your life simpler as you have direct control over the version you are running.

## Directory Structure

As projects with just `package.json` are very boring, we should set up something more concrete. Let's do a little web site that loads some JavaScript which we build using Webpack. Here's a structure that works:

- /app
  - main.js
  - component.js
- /build
  - bundle.js (automatically generated, no need to create this)
  - index.html
- package.json
- webpack.config.js

In this case we'll generate `bundle.js` using Webpack based on our `/app`. To make this possible, let's set up `webpack.config.js`.

### Creating Webpack Configuration

In our case a basic configuration could look like this:

**webpack.config.js**

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

We use `path.resolve` here as it is preferred to use absolute paths with Webpack. If you move your configuration below some directory, you'll need to take this in count.

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

*app/main.js*

```javascript
var component = require('./component.js');
var app = document.getElementById('app');

app.appendChild(component());
```

Now run `node_modules/.bin/webpack` in your terminal and your application will be built. A *bundle.js* file will appear in your `/build` folder. You should see something along this at your terminal:

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
    <div id="app"></div>

    <script src="bundle.js"></script>
  </body>
</html>
```

We simply just point at the bundle via *script* `src`, nothing more than that. It would be possible to generate this file with Webpack using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). You can give it a go if you are feeling adventurous. It is mostly a matter of configuration.

Generally this is the way you work with Webpack. You figure out what you want to load, find a loader and hook it up. Sometimes you'll need to implement loaders yourself but we'll cover that later.

## Running the Application

Just double-click the *index.html* file or set up a web server pointing to the `build/` folder. One easy way to achieve this is to install `serve` (`npm i serve -g`) and hit `serve` within the `build` directory.

## Setting Up `package.json` *scripts*

It can be useful to run build, serve and such commands through `npm`. That way you don't have to worry about the technology used in the project. You just invoke the commands. This can be achieved easily by setting up a `scripts` section to `package.json`.

In this case we can move the build step behind `npm run build` by adding the following section at `package.json`:

```json
"scripts": {
  "build": "webpack"
}
```

You can either replace the current `scripts` section with the above or just add that `build` line there. To invoke a build, you can hit `npm run build` now. NPM will find it as `npm run` adds Webpack to the `PATH` temporarily.

Later on this approach will become more powerful as project complexity grows. You can hide the complexity within `scripts` while keeping the interface simple.

The potential problem with this approach is that it can tie you to a Unix environment in case you use environment specific commands. If so, you may want to consider using something environment agnostic, such as [gulp-webpack](https://www.npmjs.com/package/gulp-webpack).

## Supported Module Formats

Webpack allows you to use different module formats, but under the hood they all work the same way. All of them also works straight out of the box. So far we have used **CommonJS** familiar from Node.js but we can also work with various others. You can try the following.

**ES6**

ES6 is probably the format we all have been waiting for since 1995. As you can see it resembles CommonJS a little bit and is quite clear!

```javascript
import MyModule from './MyModule.js';

// export at module root
export default function () { ... };

// alternatively export as module function
export function hello() {...};
```

**AMD**

AMD, or Asynchronous Module Definition, is a solution that was invented to work around the pain of a world without modules. It introduces a `define` wrapper.

```javascript
define(['./MyModule.js'], function (MyModule) {
  // export at module root
  return function() {};
});

// alternatively
define(['./MyModule.js'], function (MyModule) {
  // export as module function
  return {
    hello: function() {...}
  };
});
```

Incidentally it is possible to use `require` within the wrapper like this:

```javascript
define(['require'], function (require) {
  var MyModule = require('./MyModule.js');

  return function() {...};
});
```

This approach definitely eliminates some of the clutter but you will still end up with some code that might feel redundant. Given there's ES6 now, it probably doesn't make much sense to use AMD anymore unless you really have to.

**UMD**

UMD, Universal Module Definition, is a monster of a format that aims to make the aforementioned formats compatible with each other. I will spare your eyes from it. Never write it yourself, leave it to the tools. If that didn't scare you off, check out [the official definitions](https://github.com/umdjs/umd).

Webpack can generate UMD wrapper for you (`output.libraryTarget: 'umd'`). This is particularly useful for library authors. We'll get back to this later.

## Conclusion

Getting a simple build like this isn't very complex. In the end you'll end up with a little bit configuration. Webpack deals with the nasty details for you after that. We are close to unleashing the power of Webpack here as you will soon see.

Next we'll discuss Webpack compared to some other solutions. After that we'll get back to this example as hitting `npm run build` all the time and refreshing browser during development doesn't sound that lucrative. We can do something about that.
