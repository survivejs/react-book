# Webpack Compared

To understand Webpack, it will help to look at the history. That will put the tool in context and show you why the approach is powerful. Back in the day we were happy just to concat some scripts together but that won't do anymore. JavaScript libraries can be very large these days and nobody likes to wait for it all to load for the application show up.

This problem has been escalated by the rise of Single Page Applications. They tend to rely on various quite heavy libraries and be complex by nature. Ideally you would just load the assets you need per page.

The popularity of Node.js and [npm](https://www.npmjs.com/), the Node.js package manager, provides more context. Before these developments, it was difficult to consume dependencies. Now that npm is used increasingly for frontend development, the situation has changed dramatically. Thanks to modern tooling we have nice ways to manage the dependencies of our frontend projects.

Historically speaking there have been many build systems. [Make](https://en.wikipedia.org/wiki/Make_%28software%29) is perhaps the most known one and still a viable option in many cases. In the world of frontend development particularly [Grunt](http://gruntjs.com/) and [Gulp](http://gulpjs.com/) have gained popularity. Both are made powerful by plugins available via npm.

## Grunt

![Grunt](/images/grunt.png)

Grunt went mainstream before Gulp. It was made popular particularly due to its plugin architecture. At the same time this is the Achilles' heel of Grunt. You *don't* want to end up having to maintain a 300 line `Gruntfile`. Grunt scales up to a point. Just in case you are curious what the configuration looks like, here's an example from [Grunt documentation](http://gruntjs.com/sample-gruntfile):

```javascript
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint']);
};
```

In this sample we define two basic tasks related to `jshint`, a linting tool that helps you spot possible problem spots at your source. We have a standalone task for running the tool against our source. In addition we have a watcher based task. If we run it, we'll get warnings interactively at our terminal as we edit.

In practice you would have a lot of small tasks such as these for various purposes such as building the project. The example shows well how these tasks are constructed. An important part of the power of Grunt is that it hides a lot of the wiring from you. Taken too far this can get problematic though as you don't understand well enough what's going on under the hood.

T> Note that [grunt-webpack](https://www.npmjs.com/package/grunt-webpack) plugin allows you to use Webpack in Grunt environment. You can leave the heavy lifting to Webpack while utilizing the Grunt plugins you are familiar with.

## Gulp

![Gulp](/images/gulp.png)

Gulp takes a different approach. Instead of relying on configuration per plugin you deal with actual code. Gulp builds on top of the tried and true concept of piping. If you are familiar with Unix, it's the same here.

You simply have sources, filters and sinks. In this case sources happen to match to some files, filters perform some operations on those (ie. convert to JavaScript) and then output to sinks (your build directory etc.).

Here's a sample `Gulpfile` to give you a better idea of the approach taken from the project README and abbreviated a bit:

```javascript
var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var paths = {
    scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(coffee())
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts']);
```

Given the configuration is code you can always just hack it if you run into troubles. You can wrap existing Node.js modules as Gulp plugins and so on. Compared to Grunt you have a clearer idea of what's going on. You still end up writing a lot of boilerplate for casual tasks, though. That is where some newer approaches come in.

T> [gulp-webpack](https://www.npmjs.com/package/gulp-webpack) allows you to use Webpack in Gulp environment.

## Browserify

![Browserify](/images/browserify.png)

Dealing with JavaScript modules has always been a bit of a problem given the language actually doesn't have a concept of module till ES6. Ergo we are stuck with the 90s when it comes to browser environment. Various solutions, including [AMD](http://browserify.org/), have been proposed.

In practice it can be useful just to use CommonJS, the Node.js format, and let tooling deal with the rest. The advantage is that you can often hook into npm and avoid reinventing the wheel.

[Browserify](http://browserify.org/) solves this problem. It provides a way to bundle CommonJS modules together. You can hook it up with Gulp. In addition there are tons of smaller transformation tools that allow you to move beyond the basic usage (ie. [watchify](https://www.npmjs.com/package/watchify) provides a file watcher that creates bundles for you during development automatically). This will save some effort and no doubt is a good solution up to a point.

Browserify ecosystem is composed from a lot of small modules. This way they remind of the Unix philosophy. It is a little easier to adopt than Webpack and in fact it is a good alternative to it.

## Webpack

![Webpack](/images/webpack.png)

You could say Webpack takes more monolithic approach than Browserify. You simply get more out of the box. It is extended using loaders and relies on configuration. As we saw in the previous chapter it took some effort to get a build done. But after the initial curve it eases out considerably.

Webpack expands on the idea of hooking into CommonJS `require`. What if you could just `require` whatever you needed in your code, be it CoffeeScript, Sass, Markdown or something? Well, Webpack does just this.

It takes your dependencies, puts them through loaders and outputs browser compatible static assets. All of this is based on configuration. Here is a sample configuration from [the official Webpack tutorial](http://webpack.github.io/docs/tutorials/getting-started/):

```javascript
module.exports = {
  entry: './entry.js',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css'
      }
    ]
  }
};
```

### Supported Module Formats

Webpack allows you to use different module formats, but under the hood they all work the same way. All of them also work straight out of the box.

**CommonJS**

If you have used Node.js, you are likely familiar with CommonJS already. Here's a brief example:

```javascript
var MyModule = require('./MyModule');

// export at module root
module.exports = function() { ... };

// alternatively export individual functions
exports.hello = function() {...};
```

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

In the following chapters we'll build on top of this idea and show how powerful it is. You can, and probably should, use Webpack with some other tools. It won't solve everything. It does solve the difficult problem of bundling, however, and that's one worry less during development.
