# Asset Management

Until HTTP/2 is here you want to avoid setting up too many HTTP requests when your application is loading. Depending on the browser you have a set number of requests that can run in parallel.

## Inlining Images

If you load a lot of images in your CSS it is possible to automatically inline these images as Base64 strings to lower the number of requests required. This can be based on the size of the image. There is a balance of size of download and number of downloads that you have to figure out for your project, and Webpack makes that balance easy to adjust.

## Installing the url-loader

`npm install url-loader --save-dev` will install the loader that can convert resolved paths as Base64 strings. As mentioned in other sections of this cookbook Webpack will resolve "url()" statements in your CSS as any other require or import statements. This means that if we test on image file extensions for this loader we can run them through it.

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
      test: /\.(png|jpg)$/,
      loader: 'url?limit=25000'
    }]
  }
};
```

The limit is an argument passed to the url-loader. It tells it that images that er 25KB or smaller in size will be converted to a Base64 string and included in the CSS file where it is defined.

## Inlining Fonts

Fonts can be really difficult to get right. First of all we have typically 4 different formats, but only one of them will be used by the respective browser. You do not want to inline all 4 formats, as that will just bloat your CSS file and in no way be an optimization.

### Choose one format

Depending on your project you might be able to get away with one font format. If you exclude Opera Mini, all browsers support the .woff and .svg format. The thing is that fonts can look a little bit different in the different formats, on the different browsers. So try out .woff and .svg and choose the one that looks the best in all browsers.

There are probably other strategies here too, so please share by creating an issue or pull request.

## Doing the actual inlining

You do this exactly like you do when inlining images.

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
      test: /\.woff$/,
      loader: 'url?limit=100000'
    }]
  }
};
```

Just make sure you have a limit above the size of the fonts, or they will of course not be inlined.

> TBD: is there anything else that can/should be inlined?

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

