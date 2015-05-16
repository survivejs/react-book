# Linting in Webpack

why etc.

TODO

JSlint, JShint etc.

## Setting Up ESLint

A little discipline goes a long way in programming. Linting is one of those techniques that will simplify your life a lot at a minimal cost. You can fix potential problems before they escalate into actual issues. It won't replace testing but will definitely help. It is possible to integrate this process into your editor/IDE.

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
node_modules/
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

If you hit `npm run lint` now, you should get some errors and warnings to fix depending on the rules you have set up. Go ahead and fix them. You can check [the book site](https://github.com/survivejs/webpack) for potential fixes if you get stuck.

T> Note that like some other tools, such as JSCS and JSHint, ESlint supports `package.json` based configuration. Simply add a `eslintConfig` field to it and write the configuration there.

T> It is possible to generate a sample `.eslintrc` using `eslint --init` (or `node_modules/.bin/eslint --init` for local install). This can be useful on new projects.

### Dealing with `ELIFECYCLE` Error

In case the linting process fails, `npm` will give you a nasty looking `ELIFECYCLE` error. If you want to hide this, you can change the script into this form:

**package.json**

```json
"scripts": {
  ...
  "lint": "eslint . --ext .js --ext .jsx || true"
}
...
```

This will keep the output tidy. The potential problem with this approach is that in case you invoke `lint` through some continuous integration (CI) system and expect it to return non-zero exit code, it won't. In our case we rely on Webpack to run ESlint for us so the somewhat ugly output isn't that big an issue and allows CI to work.

T> An alternative way to achieve a tidier output is to invoke `npm run lint --silent`. That will hide the `ELIFECYCLE` bit.

### Connecting ESlint with Webpack

We can make Webpack emit ESLint messages for us by using [eslint-loader](https://www.npmjs.com/package/eslint-loader). As the first step hit `npm i eslint-loader --save-dev` to add it to the project.

Next we need to tweak our development configuration to include it. Add the following section to it:

**webpack.config.js**

```javascript
if(TARGET === 'dev') {
  module.exports = mergeConfig({
    entry: ['webpack/hot/dev-server'],
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
  });
}
```

We are using `preLoaders` section here as we want to play it safe. This section is executed before `loaders` get triggered.

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

### ESlint Resources

Besides the official documentation available at [eslint.org](http://eslint.org/), you should check out the following blog posts:

* [Lint Like It’s 2015](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) - This post by Dan Abramov shows how to get ESlint work well with Sublime Text.
* [Detect Problems in JavaScript Automatically with ESLint](http://davidwalsh.name/eslint) - A good tutorial on the topic.
* [Understanding the Real Advantages of Using ESLint](http://rangle.io/blog/understanding-the-real-advantages-of-using-eslint/) - Evan Schultz's post digs into details.
* [eslint-plugin-smells](https://github.com/elijahmanor/eslint-plugin-smells) - This plugin by Elijah Manor allows you to lint against various JavaScript smells. Recommended.

## Checking JavaScript Style with JSCS

Especially in a team environment it can be annoying if one guy uses tabs and other spaces. There can also be discrepancies between space usage. Some like to use two, some like four for indentation. In short it can get pretty messy without any discipline.

Fortunately there is a tool known as [JSCS](http://jscs.info/). It will allow you to define a style guide for your project.

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
