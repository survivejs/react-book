# Linting in Webpack

Nothing is easier than making mistakes when coding in JavaScript. Linting is one of those techniques that can help you to make less mistakes and spot issues before they become actual problems.

Perhaps the most known linter that started it all for JavaScript is Douglas Crockford's [JSLint](http://www.jslint.com/). It is opinionated like the man himself. The next step in evolution was [JSHint](http://jshint.com/). It took the opinionated edge out of JSLint and allowed for more customization.

[ESLint](http://eslint.org/) is the newest tool in vogue. It has learned from its predecessors and takes linting to the next level. Besides allowing you to implement custom rules, you can hook it with custom parsers and reporters. This means ESLint will work with Babel and JSX syntax. The project rules have been well documented and you will have control over their severity. These features alone make it a powerful tool.

Besides linting for issues it can be useful to manage code style on some level. Nothing is more annoying than having to work with source that has mixed tabs or spaces and all kinds of shenanigans. Stylistically consistent code reads better and is easier to work with particularly in a team environment.

[JSCS](http://jscs.info/) is a tool that makes it possible to define a style guide of your own for JavaScript code. It is easy to integrate into your project through Webpack.

In this chapter I'll go through these tools briefly. We'll integrate just ESLint into our project. Of course if you want, you can give the other tools a go. Just don't be surprised that they aren't included in the demonstration code.

## Webpack and JSHint

Interestingly no JSLint loader seems to exist for Webpack yet. Fortunately there's one for JSHint. If you already using it, setting it up with Webpack is easy. You will need to install [jshint-loader](https://www.npmjs.com/package/jshint-loader) to your project (`npm i jshint-loader --save-dev`). In addition you will need a little bit of configuration.

```javascript
module: {
  preLoaders: [
    {
      test: /\.js$/,
      // define an include so we check just the files we need
      include: path.join(ROOT_PATH, 'app'),
      loader: 'jshint'
    }
  ]
},
```

You can also define custom settings using a `jshint` object. The project README covers that in detail. The tool will look into specific rules to apply from `.jshintrc`. Those have been covered at JSHint documentation in detail. An example configuration could look like this:

**.jshintrc**

```json
{
  "bitwise": true,
  "browser": true,
  "camelcase": false,
  "curly": true,
  "eqeqeq": true,
  "esnext": true,
  "immed": true,
  "indent": 2,
  "latedef": false,
  "newcap": true,
  "noarg": true,
  "node": true,
  "quotmark": "double",
  "strict": true,
  "trailing": true,
  "undef": true,
  "unused": true,
  "sub": true
}
```

Besides setting it up with Webpack it can be highly beneficial to look into an integration with your editor or IDE. Having warnings and errors inline makes a world of difference. Webpack will still complain but an integrated approach has its benefits.

## Setting Up ESLint

[ESLint](http://eslint.org/) is a recent linting solution for JavaScript. It builds on top of ideas presented by JSLint and JSHint. Most importantly it allows you to develop custom rules. As a result a nice set of rules have been developed for React in form of [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react).

### Connecting ESlint with `package.json`

In order to integrate ESLint with our project, we'll need to do a couple of little tweaks. To get it installed, invoke `npm i babel-eslint eslint eslint-plugin-react --save-dev`. That will add ESLint and the plugin we want to use as our project development dependency. Next we'll need to do some configuration to make linting work in our project.

**package.json**

```json
"scripts": {
  ...
  "lint": "eslint . --ext .js --ext .jsx"
}
...
```

This will trigger ESlint against all JS and JSX files of our project. That's definitely too much so we'll need to restrict it. Set up *.eslintignore* to the project root like this:

**.eslintignore**

```bash
build/
```

Next we'll need to activate [babel-eslint](https://www.npmjs.com/package/babel-eslint) so that ESLint works with our Babel code. In addition we need to activate React specific rules and set up a couple of our own. You can adjust these to your liking. You'll find more information about the rules at [the official rule documentation](http://eslint.org/docs/rules/).

**.eslintrc**

```json
{
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": [
    "react"
  ],
  "ecmaFeatures": {
    "jsx": true,
    "modules": true
  },
  "rules": {
    "no-shadow": false,
    "strict": [2, "global"],
    "no-underscore-dangle": false,
    "no-use-before-define": false,
    "eol-last": false,
    "quotes": [2, "single"],
    "comma-dangle": "always",
    "react/jsx-boolean-value": 1,
    "react/jsx-quotes": 1,
    "react/jsx-no-undef": 1,
    "react/jsx-uses-react": 1,
    "react/jsx-uses-vars": 1,
    "react/no-did-mount-set-state": 1,
    "react/no-did-update-set-state": 1,
    "react/no-multi-comp": 1,
    "react/no-unknown-property": 1,
    "react/react-in-jsx-scope": 1,
    "react/self-closing-comp": 1,
    "react/wrap-multilines": 1
  }
}
```

Note how we can define severity of an individual rule by passing it a number. Zero or ´false` would mean a rule is set off. One would mark it as a warning. Two would yield an error. In some cases you can pass additional parameters to a rule by using an array notation.

If you hit `npm run lint` now, you should get some errors and warnings to fix depending on the rules you have set up. Go ahead and fix them if there are any. You can check [the book site](https://github.com/survivejs/webpack) for potential fixes if you get stuck.

T> Note that like some other tools, such as JSCS and JSHint, ESlint supports `package.json` based configuration. Simply add a `eslintConfig` field to it and write the configuration there.

T> It is possible to generate a sample `.eslintrc` using `eslint --init` (or `node_modules/.bin/eslint --init` for local install). This can be useful on new projects.

### Dealing with `ELIFECYCLE` Error

In case the linting process fails, `npm` will give you a nasty looking `ELIFECYCLE` error.A good way to achieve a tidier output is to invoke `npm run lint --silent`. That will hide the `ELIFECYCLE` bit. You can define an alias for this purpose. At Unix you would do `alias run='npm run --silent'` and then `run <script>`.

Alternatively you could pipe output to `true` like this:

**package.json**

```json
"scripts": {
  ...
  "lint": "eslint . --ext .js --ext .jsx || true"
}
...
```

The potential problem with this approach is that in case you invoke `lint` through some other command, it will pass the test even if there are failures! In other words if you have another script that does something like `npm run lint && npm run build`, it will build regardless of the output of the first command.

### Connecting ESlint with Webpack

We can make Webpack emit ESLint messages for us by using [eslint-loader](https://www.npmjs.com/package/eslint-loader). As the first step hit `npm i eslint-loader --save-dev` to add it to the project.

Next we need to tweak our development configuration to include it. Add the following section to it:

**webpack.config.js**

```javascript
if(TARGET === 'dev') {
  module.exports = mergeConfig({
    entry: [...],
    module: {
      preLoaders: [
        {
          test: /\.jsx?$/,
          // we are using `eslint-loader` explicitly since
          // we have eslint module installed. This way we
          // can be certain that it uses the right loader
          loader: 'eslint-loader',
          include: path.join(ROOT_PATH, 'app'),
        }
      ],
    },
    output: {...},
    ...
  });
}
```

We are using `preLoaders` section here as we want to play it safe. This section is executed before possible `loaders` get triggered.

If you execute `npm start` now and break some linting rule while developing, you should see that in terminal output.

### Customizing ESlint

Sometimes you'll want to skip certain rules per file or per line. Consider the following examples:

```javascript
// everything
/* eslint-disable */
...
/* eslint-enable */
```

```javascript
// specific rule
/* eslint-disable no-unused-vars */
...
/* eslint-enable no-unused-vars */
```

```javascript
// tweaking a rule
/* eslint no-comma-dangle:1 */
```

```javascript
// disable rule per line
alert('foo'); // eslint-disable-line no-alert
```

Note that the rule specific examples assume you have the rules in your configuration in the first place! You cannot specify new rules here. Instead you can modify the behavior of existing rules.

### Writing Your Own Rules

ESlint rules rely on Abstract Syntax Tree (AST) definition of JavaScript. It is a data structure that describes JavaScript code after it has been lexically analyzed. There are tools such as [recast](https://github.com/benjamn/recast) that allow you perform transformations on JavaScript code by using AST transformations. The idea is that you match some structure, then transform it somehow and convert AST back to JavaScript.

To get a better idea of how AST works and what it looks like you can check out [online JavaScript AST visualization](http://jointjs.com/demos/javascript-ast). Alternatively you can install `recast` and examine the output it gives. That is the structure we'll be working with at ESlint rules.

In ESlint's case we just want to check the structure and report in case something is wrong. Getting a simple rule done is surprisingly simple:

1. Create a directory for your rules, say `eslint-rules`
2. Point ESlint to the directory using `eslint ... --rulesdir eslint-rules`.
3. Create a file for your rule there, you can call it `demo.js`
4. Modify your `.eslintrc` to use the rule like this:

**.eslintrc**

```json
"rules": {
  "demo": 1,
  ...
}
```

Finally you will need to make the rule to do something. In this case we just report for every identifier found:

**eslint-rules/demo.js**

```javascript
module.exports = function(context) {
    return {
        Identifier: function(node) {
            context.report(node, 'This is unexpected!');
        }
    };
};
```

If you invoke ESlint now (remember to pass `rulesdir`), you should see a bunch of warnings.

Of course the rule doesn't do anything useful yet. To get forward I recommend checking out [the official documentation about rules](http://eslint.org/docs/developer-guide/working-with-rules.html). You can also check out some of the existing rules and plugins for inspiration.

### ESlint Resources

Besides the official documentation available at [eslint.org](http://eslint.org/), you should check out the following blog posts:

* [Lint Like It’s 2015](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) - This post by Dan Abramov shows how to get ESlint work well with Sublime Text.
* [Detect Problems in JavaScript Automatically with ESLint](http://davidwalsh.name/eslint) - A good tutorial on the topic.
* [Understanding the Real Advantages of Using ESLint](http://rangle.io/blog/understanding-the-real-advantages-of-using-eslint/) - Evan Schultz's post digs into details.
* [eslint-plugin-smells](https://github.com/elijahmanor/eslint-plugin-smells) - This plugin by Elijah Manor allows you to lint against various JavaScript smells. Recommended.

## Checking JavaScript Style with JSCS

Especially in a team environment it can be annoying if one guy uses tabs and other spaces. There can also be discrepancies between space usage. Some like to use two, some like four for indentation. In short it can get pretty messy without any discipline. Fortunately there is a tool known as JSCS. It will allow you to define a style guide for your project.

[jscs-loader](https://github.com/unindented/jscs-loader) provides Webpack hooks to the tool. Integration is similar as in the case of ESlint. You would define `.jscsrc` with your style guide rules and use configuration like this:

```javascript
module: {
  preLoaders: [
    {
      test: /\.jsx?$/,
      loaders: ['eslint', 'jscs'],
      include: path.join(ROOT_PATH, 'app'),
    }
  ],
},
```

To make it work with JSX, you'll need to point it to `esprima-fb` parser through `.jscsrc`. There are also various other options and even some presets. Consider the example below:

**.jscsrc**

```json
{
  "esprima": "esprima-fb",
  "preset": "google",

  "fileExtensions": [".js", ".jsx"],

  "requireCurlyBraces": true,
  "requireParenthesesAroundIIFE": true,

  "maximumLineLength": 120,
  "validateLineBreaks": "LF",
  "validateIndentation": 4,

  "disallowKeywords": ["with"],
  "disallowSpacesInsideObjectBrackets": null,
  "disallowImplicitTypeConversion": ["string"],

  "safeContextKeyword": "that",

  "excludeFiles": [
    "dist/**",
    "node_modules/**"
  ]
}
```

We won't use the tool in this project but it's good to be aware of it.

T> Note that like some other tools, such as ESlint and JSHint, JSCS supports `package.json` based configuration. Simply add a `jscsConfig` field to it and write the configuration there.

## Conclusion

In this chapter you learned how to lint your code using Webpack in various ways. It is one of those techniques that yields benefits over longer term as you get to fix possible problems before they become actual issues. Next we'll delve deeper as we discuss hot module reloading and React in the next chapter.
