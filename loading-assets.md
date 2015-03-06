# Loading Assets

So far we have been requiring just JavaScript files that use CommonJS. As per definition, Webpack supports much more than that. Let's explore some common cases.

## Modules

Webpack allows you to use different module patterns, but "under the hood" they all work the same way. All of them also works straight out of the box.

**CommonJS**

This is what we have used so far. If you are familiar with Node.js, you have probably used this pattern a lot.

```javascript
var MyModule = require('./MyModule.js');

// export at module root
exports = function() {...};

// export as module function
export.hello = function() {...};
```

**ES6 modules**

ES6 is probably the format we all have been waiting for since 1995. Finally here! As you can see it resembles CommonJS a little bit and is quite clear!

```javascript
import MyModule from './MyModule.js';

// export at module root
export default function () { ... };
```

```javascript
import MyModule from './MyModule.js';

// export as module function
export function hello() {...};
```

**AMD**

AMD, or Asynchronous Module Definition (not the silicon company), is a solution that was invented to work around the pain of a world without modules. It introduces a `define` wrapper.

```javascript
define(['./MyModule.js'], function (MyModule) {
    // export at module root
    return function() {};
});
```

```javascript
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

This approach definitely eliminates some of the clutter but you will still end up with some code that might feel redundant.

**UMD**

UMD, Universal Module Definition, is a monster of a format that aims to make the aforementioned formats compatible with each other. I will spare your eyes from it. Never write it yourself, leave it to the tools. If that didn't scare you off, check out https://github.com/umdjs/umd .

## Understanding Paths

A module is loaded by filepath. Imagine the following tree structure:

- /app
  - /modules
    - MyModule.js
  - main.js (entry point)
  - utils.js

Lets open up the *main.js* file and require *app/modules/MyModule.js* in the two most common module patterns:

*app/main.js*

```javascript
// ES6
import MyModule from './modules/MyModule.js';

// CommonJS
var MyModule = require('./modules/MyModule.js');
```

The `./` at the beginning states "relative to the file I am in now".

Now let us open the *MyModule.js* file and require **app/utils**.

*app/modules/MyModule.js*

```javascript
// ES6 relative path
import utils from './../utils.js';

// ES6 absolute path
import utils from '/utils.js';

// CommonJS relative path
var utils = require('./../utils.js');

// CommonJS absolute path
var utils = require('/utils.js');
```
The **relative path** is relative to the current file. The **absolute path** is relative to the entry file, which in this case is *main.js*.

### Do I have to use file extension?

No, you do not have to use *.js*, but it highlights better what you are requiring. You might have some .js files, and some .jsx files and even images and css can be required by Webpack. It also clearly differs from required node_modules and specific files.

Remember that Webpack is a module bundler! This means you can set it up to load any format you want given there is a loader for it. We'll delve into this topic later on.

> TBD: explain other file types here as well. this seems like the right place for that

## Loading CSS

Webpack allows you to load CSS like you load any other code. What strategy you choose is up to you, but you can do everything from loading all your css in the main entry point file to one css file for each component.

Loading CSS requires the **css-loader** and the **style-loader**. They have two different jobs. The **css-loader** will go through the CSS file and find `url()` expressions and resolve them. The **style-loader** will insert the raw css into a style tag on your page.

### Preparing CSS loading

Install the two loaders: `npm install css-loader style-loader --save-dev`.

In the *webpack.config.js* file you can add the following loader configuration:

*webpack.config.js*

```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx'
    }, {
      test: /\.css$/, // Only .css files
      loader: 'style!css' // Run both loaders
    }]
  }
};

module.exports = config;
```

### Loading a CSS file

Loading a CSS file is a simple as loading any file:

*main.js*

```javascript
import './main.css';
// Other code
```

*Component.jsx*

```javascript
import './Component.css';
import React from 'react';

export default React.createClass({
  render: function () {
    return <h1>Hello world!</h1>
  }
});
```

**Note!** You can of course do this with both CommonJS and AMD.

### CSS loading strategies

Depending on your application you might consider three main strategies. In addition to this you should consider including some of your basic CSS inlined with the initial payload (index.html). This will set the structure and maybe a loader while the rest of your application is downloading and executing.

### All in one

In your main entry point, e.g. `app/main.js` you can load up your entire CSS for the whole project:

*app/main.js*

```javascript
import './project-styles.css';
// Other JS code
```

The CSS is included in the application bundle and does not need to download.


### Lazy loading

If you take advantage of lazy loading by having multiple entry points to your application, you can include specific CSS for each of those entry points:

*app/main.js*

```javascript
import './style.css';
// Other JS code
```

*app/entryA/main.js*

```javascript
import './style.css';
// Other JS code
```

*app/entryB/main.js*

```javascript
import './style.css';
// Other JS code
```

You divide your modules by folders and include both CSS and JavaScript files in those folders. Again, the imported CSS is included in each entry bundle when running in production.

### Component specific

With this strategy you create a CSS file for each component. It is common to namespace the CSS classes with the component name, thus avoiding some class of one component interfering with the class of an other.

*app/components/MyComponent.css

```css
.MyComponent-wrapper {
  background-color: #EEE;
}
```

*app/components/MyComponent.jsx*

```
import './MyComponent.css';
import React from 'react';

export default React.createClass({
  render: function () {
    return (
      <div className="MyComponent-wrapper">
        <h1>Hello world</h1>
      </div>
    )
  }
});
```

## Using inline styles instead of stylesheets

With native React.js you do not use stylesheets at all, you only use the *style-attribute*. By defining your CSS as objects. Depending on your project, you might consider this as your CSS strategy.

*app/components/MyComponent.jsx*

```javascript
import React from 'react';

var style = {
  backgroundColor: '#EEE'
};

export default React.createClass({
  render: function () {
    return (
      <div style={style}>
        <h1>Hello world</h1>
      </div>
    )
  }
});
```

## Loading LESS or SASS

If you want to use compiled CSS, there are two loaders available for you. The **less-loader** and the **sass-loader**. Depending on your preference, this is how you set it up.

## Installing and configuring the loader

`npm install less-loader` or `npm install sass-loader`.

*webpack.config.js*
```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx'
    },

    // LESS
    {
      test: /\.less$/,
      loader: 'style!css!less'
    },

    // SASS
    {
      test: /\.scss$/,
      loader: 'style!css!sass'
    }]
  }
};
```

## What about imports in LESS and SASS?

If you import one LESS/SASS file from an other, use the exact same pattern as anywhere else. Webpack will dig into these files and figure out the dependencies.

```less
@import "./variables.less";
```

You can also load LESS files directly from your node_modules directory.
```less
$import "~bootstrap/less/bootstrap";
```

**Note!** Webpack is currently unable to resolve SASS import statements, but it will very soon: [issue 31](https://github.com/jtangelder/sass-loader/issues/31)

> TBD: hopefully this will be resolved before publication

> TBD: remember to mention that loaders operate on regex input
