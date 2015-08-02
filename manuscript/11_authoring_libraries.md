# Authoring Libraries

[npm](https://www.npmjs.com/) is one of the reasons behind the popularity of Node.js. It has become the package manager for JavaScript. Although initially it was used mostly for managing backend packages, it has become increasingly popular in frontend development. As you have seen so far it is easy to consume npm packages using webpack.

Eventually you might want to publish your own packages. You can consider our demo application a package of its own, sort of. We could even design applications to be pluggable so that you could glue them into a bigger whole. This would take some careful thought but in theory you could split everything up in smaller sections which you then knit together.

## Anatomy of a npm Package

Most of npm packages are small and include just a select few files such as:

* `index.js` - On small projects it's enough to have the code at the root. On larger ones you may want to start splitting it up further.
* `package.json` - npm metadata in JSON format
* `README.md` - README is the most important document of your project. It is written in Markdown format and provides an overview. On simple projects the whole documentation can fit there. It will be shown at the package page at `npmjs.com`.
* `LICENSE` - You should include licensing information within your project. You can refer to it from `package.json`.

In bigger projects you may find the following:

* `CONTRIBUTING.md` - A guide for potential contributors. How should the code be developed and so on.
* `CHANGELOG.md` - This document describes major changes per version. If you do major API changes, it can be a good idea to cover them here. It is possible to generate the file based on Git commit history provided you write nice enough commits.
* `.travis.yml` - [Travis CI](https://travis-ci.org/) is a popular continuous integration platform that is free for open source projects. You can run the tests of your package over multiple systems using it. There are other alternatives of course but Travis is very popular.
* `bower.json` - [Bower](http://bower.io/) specific metadata. Bower is a popular package manager for frontend. That said, just providing npm support is often enough.
* `.gitignore` - Ignore patterns for Git. I.e. which file shouldn't go to version control.
* `.eslintignore` - Ignore patterns for ESLint. Again, tool specific.
* `.npmignore` - Ignore patterns for npm. This describes which files shouldn't go to your distribution version.
* `.eslintrc` - Linting rules. You can use `.jshintrc` etc. based on your preferences.
* `webpack.config.js` - If you are using a simple setup, you might as well have the configuration at project root.

In addition you'll likely have various directories for source, tests, demos, documentation and so on.

## Understanding `package.json`

All packages come with a `package.json` that describes metadata related to them. This includes information about the author, various links, dependencies and so on. The [official documentation](https://docs.npmjs.com/files/package.json) covers them in detail.

I've annotated `package.json` of my [React component boilerplate](https://github.com/survivejs/react-component-boilerplate) below.

```json
{
  /* Name of the project */
  "name": "react-component-boilerplate",
  /* Brief description */
  "description": "Boilerplate for React.js components",
  /* Who is the author + optional email */
  "author": "Juho Vepsalainen <email goes here>",
  /* This is boilerplate specific (not used by npm) */
  "user": "bebraw",
  /* Version of the package */
  "version": "0.0.0",
  /* `npm run <name>` */
  "scripts": {
    "start": "TARGET=dev node dev-server/server.js",
    "test": "jest && npm run check-style && npm run lint",
    "gh-pages": "TARGET=gh-pages webpack --config ./config",
    "deploy-gh-pages": "TARGET=gh-pages node ./config/deploy-gh-pages.js",
    "dist": "TARGET=dist webpack && TARGET=dist-min webpack",
    "dist-modules": "babel ./src --out-dir ./dist-modules",
    "lint": "eslint . --ext .js --ext .jsx",
    "check-style": "jscs .",
    "replace-meta": "node scripts/replace_meta.js",
    "preversion": "npm run test && npm run dist && npm run dist-modules && git commit -am \"Update dist\"",
    "postpublish": "npm run gh-pages && npm run deploy-gh-pages"
  },
  /* Entry point for terminal (i.e. <package name>) */
  /* Don't set this unless you intend to allow cli usage */
  "bin": "./index.js",
  /* Entry point (defaults to index.js) */
  "main": "dist-modules/index.js",
  /* Package dependencies (small if possible) */
  "dependencies": {},
  /* Package development dependencies */
  "devDependencies": {
    "babel": "^5.1.10",
    "babel-eslint": "^3.0.1",
    "babel-loader": "^5.0.0",
    ...
    "webpack": "^1.8.4",
    "webpack-dev-server": "^1.8.0"
  },
  /* You may want to give a rough dependency hint for things
   * like React components. The idea is to avoid depending
   * directly and let user deal with it instead.
   *
   * If the rule is too strict, that will cause problems for
   * the user. */
  "peerDependencies": {
    "react": ">=0.11.2 <1.0.0"
  },
  /* Links to repository, homepage and so on */
  "repository": {
    "type": "git",
    "url": "https://github.com/bebraw/react-component-boilerplate.git"
  },
  "homepage": "https://bebraw.github.io/react-component-boilerplate/",
  "bugs": {
    "url": "https://github.com/bebraw/react-component-boilerplate/issues"
  },
  /* Keywords related to package,
   * fill this well to make the package findable */
  "keywords": [
    "react",
    "reactjs",
    "boilerplate"
  ],
  /* Which license to use */
  "license": "MIT",
  /* Jest specific metadata */
  "jest": {
    "scriptPreprocessor": "./config/preprocessor.js",
    "unmockedModulePathPatterns": [
      "./node_modules/react"
    ]
  }
}
```

As you can see `package.json` can contain a lot of information. You can attach non-npm specific metadata there that can be used by tooling.

## npm Workflow

Working with npm is surprisingly simple. Provided you have created an account on the service and logged in once using [npm adduser](https://docs.npmjs.com/cli/adduser), all you need to do is to hit `npm publish`. Given that the package name is still available, you should have something out there!

T> Before starting to develop it can be a good idea to spend a little bit of time on that naming issue. It's not very fun to write an awesome package just to notice the name has been taken. Save some time and nerves by doing a little bit of research. With some luck you could find something fitting your purposes and avoid the chore of writing a library.

T> As of npm 2.7.0 it is possible to create [scoped packages](https://docs.npmjs.com/getting-started/scoped-packages). They follow format `@username/project-name`. Simply follow that format when naming your project.

Bumping a version is simple too. You'll just need to invoke `npm version <x.y.z>`. That will update `package.json` and create a version commit automatically. If you hit `npm publish`, you should have something new out there.

Note that in the example above I've set up `version` related hooks to make sure a version will contain a fresh version of a distribution build and it will get tested just in case.

T> It can be useful to use `npm link` during development. That will allow you to use a development version of your library from some other context. Node.js will resolve to the linked version unless local `node_modules` happens to contain a version.

Sometimes you might want to publish something preliminary for other people to test. In that case you can hit `npm publish --tag beta`. After that your users can install the tagged version using `npm i <your package name>@beta`.

An alternative way to consume a library is to point at it directly at `package.json`. In that case you can do `"depName": "<github user>/<project>#<reference>"` where `<reference>` can be either commit hash, tag or branch. This can be useful especially if you need to hack around something and cannot wait for a fix.

## Respect the SemVer

Even though it is simple to publish new versions out there, it is important to respect the SemVer. Roughly it states that you should not break backwards compatibility given certain rules are met. E.g. if your current version is `0.1.4` and you do a breaking change, you should bump to `0.2.0` and document the changes. You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

## Library Formats

I output my React component in various formats at my boilerplate. I generate a version that's convenient to consume from Node.js by processing my component code through Babel. That will convert ES6 etc. goodies to a format which is possible to consume from vanilla Node.js. This allows the user to refer to some specific module within the whole if needed.

In addition I generate so called *distribution bundles*: `.js` and `.min.js`. In addition there's a sourcemap (`.map`) for both. That is useful for debugging. It is possible to consume these bundles standalone. They come with an [UMD](https://github.com/umdjs/umd) wrapper.

UMD makes it possible to consume them from various environments including global, AMD and CommonJS (Node.js format). You can refresh your memory with these by checking the Getting Started chapter for examples.

It is surprisingly easy to generate the aforementioned bundles using webpack. In case of my boilerplate the configuration is as follows:

```javascript
...

var mergeDist = merge.bind(null, {
    devtool: 'source-map',
    output: {
        path: config.paths.dist,
        libraryTarget: 'umd',
        library: config.library
    },
    entry: config.paths.lib,
    externals: {
        react: 'react',
        'react/addons': 'react/addons'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: config.paths.lib
            }
        ]
    }
});

exports.dist = mergeDist({
    output: {
        filename: config.filename + '.js'
    },
});

exports.distMin = mergeDist({
    output: {
        filename: config.filename + '.min.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
});
```

T> The example uses the same `merge` utility we defined earlier on. You should check [the boilerplate](https://github.com/bebraw/react-component-boilerplate) itself for exact configuration.

Most of the magic happens thanks to `devtool` and `output` declarations. In addition I have set up `externals` as I want to avoid bundling React into my library. Instead if will be loaded as an external dependency using the naming defined in the mapping.

## npm Lifecycle Hooks

npm provides various lifecycle hooks that can be useful. Let's say you are authoring a React component using Babel and some of its goodies. Even though you could let `package.json` *main* field point at the UMD version as generated above, this won't be ideal for those who consume it through npm.

It is better to generate a ES5 compatible version of the package for npm consumers. This can be achieved using **babel** cli tool:

```bash
babel ./lib --out-dir ./dist-modules
```

This will walk through `./lib` directory and output a processed file for each it encounters to `./dist-modules`.

Since we want to avoid having to run the command directly whenever we publish a new version, we can connect it to `prepublish` hook like this:

```json
"scripts": {
  ...
  "prepublish": "babel ./lib --out-dir ./dist-modules"
}
```

Make sure you hit `npm i babel --save-dev` to include the tool into your project.

As you probably don't want the directory content to end up to your Git repository accidentally and prefer to keep your `git status` clean, you should modify your `.gitignore` like this:

```bash
dist-modules/
...
```

T> Dealing with regular `dist` that gets versioned is trickier. Ideally the contents of it would get updated when you hit `npm version` and get into the version commit npm performs. I've set up a custom `npm run` script for this in the example above. It will run tests, generate a distribution build and hit `npm version` internally. Basic idea: `"version": "npm run test && npm run dist && npm version \"$@\" && npm run gh-pages && npm run deploy-gh-pages"`.

Besides `prepublish` npm provides a set of other hooks. The naming is always the same and follows pattern `pre<hook>`, `<hook>`, `post<hook>` where `<hook>` can be `publish`, `install`, `test`, `stop`, `start`, `restart`.

Even though npm will trigger scripts bound to these automatically, you can trigger them explicitly through `npm run` for testing (i.e. `npm run prepublish`). Regardless of the usage, the idea here is that we want to make our package as easy to consume and let our users get away with the least possible amount of work on their part.

There are plenty of smaller tricks to learn for advanced usage but those are better covered by [the official documentation](https://docs.npmjs.com/misc/scripts). Often all you need is just a `prepublish` script for build automation.

## Keeping Dependencies Up to Date

An important part of maintaining npm packages is keeping their dependencies up to date. How to do this depends a lot on the maturity of your package. Ideally you have a nice set of tests covering the functionality. If not, things can get a little hairier.

There are a few ways to approach dependency updates:

* You can update all dependencies at once and hope for the best. Tools such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) or [mankees-update_deps](https://www.npmjs.com/package/mankees-update_deps) can do this for you. Remember to invoke `npm i` after to make sure you have the right dependencies installed for testing the changes.
* Install newest version of some specific dependency. I.e. `npm i lodash@* --save`. This is more controlled way to approach the problem.
* Patch version information by hand by modifying `package.json` directly.

It is important to remember that your dependencies may introduce backwards incompatible changes. Therefore it can be useful to remember how SemVer works and study dependency release notes, if they exist, carefully. You should at least walk through version history to see what changes have been made and how they might affect you.

As keeping track of important changes can be a chore, there are a few services that can help you with that: [David](https://david-dm.org/), [versioneye](https://www.versioneye.com/), [Gemnasium](https://gemnasium.com). These services provide badges you can integrate into your project `README.md`. In addition they may email you about important changes and even point out possible security issues that have been fixed.

For testing your projects you can consider solutions such as [Travis CI](https://travis-ci.org/) or [SauceLabs](https://saucelabs.com/). Many others exist. The advantage of these is that they allow you to test your updates against a variety of platforms quickly. Something that might work on your system might not work in some specific configuration. You'll want to know about that as fast as possible to avoid introducing problems for your package consumers.

## Sharing Authorship

As packages evolve you may want to start developing with others. You could become the new maintainer of some project or pass the torch to someone other. These things happen as packages evolve.

npm provides a few commands for these purposes. It's all behind `npm owner` namespace. More specifically you'll find `ls <package name>`, `add <user> <package name>` and `rm <user> <package name>` there (i.e. `npm owner ls`). That's about it.

See [npm documentation](https://docs.npmjs.com/cli/owner) for most up to date information about the topic.

## Conclusion

You should have a basic idea on how to author npm libraries with the help of webpack now. It takes a lot of effort out of the process. Just keep the basic rules in mind when developing and remember to respect the SemVer.
