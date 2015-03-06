# Requiring Files

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
