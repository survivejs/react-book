# Authoring Libraries

[npm](https://www.npmjs.com/) is one of the reasons behind the popularity of Node.js. Even though it was used initially for managing back-end packages, it has become increasingly popular for front-end usage as well. As you saw in the earlier chapters, it is easy to consume npm packages through Webpack.

Eventually you may want to author packages of your own. Publishing one is relatively easy. There are a lot of smaller details to know, though. This chapter goes through those so that you can avoid some of the common problems.

## Anatomy of a npm Package

Most of the available npm packages are small and include just a select few files such as:

* *index.js* - On small projects it's enough to have the code at the root. On larger ones you may want to start splitting it up further.
* *package.json* - npm metadata in JSON format
* *README.md* - README is the most important document of your project. It is written in Markdown format and provides an overview. For simple projects the whole documentation can fit there. It will be shown at the package page at *npmjs.com*.
* *LICENSE* - You should include licensing information within your project. You can refer to it from *package.json*.

In larger projects you may find the following:

* *CONTRIBUTING.md* - A guide for potential contributors. How should the code be developed and so on.
* *CHANGELOG.md* - This document describes major changes per version. If you do major API changes, it can be a good idea to cover them here. It is possible to generate the file based on Git commit history, provided you write nice enough commits.
* *.travis.yml* - [Travis CI](https://travis-ci.org/) is a popular continuous integration platform that is free for open source projects. You can run the tests of your package over multiple systems using it. There are other alternatives of course, but Travis is very popular.
* *.gitignore* - Ignore patterns for Git, i.e., which files shouldn't go under version control.
* *.npmignore* - Ignore patterns for npm. This describes which files shouldn't go to your distribution version.
* *.eslintignore* - Ignore patterns for ESLint. Again, tool specific.
* *.eslintrc* - Linting rules. You can use *.jshintrc* and such based on your preferences.
* *webpack.config.js* - If you are using a simple setup, you might as well have the configuration at project root.

In addition, you'll likely have various directories for source, tests, demos, documentation, and so on.

## Understanding *package.json*

All packages come with a *package.json* that describes metadata related to them. This includes information about the author, various links, dependencies, and so on. The [official documentation](https://docs.npmjs.com/files/package.json) covers them in detail.

I've annotated a part of *package.json* of my [React component boilerplate](https://github.com/survivejs/react-component-boilerplate) below.

```json
{
  /* Name of the project */
  "name": "react-component-boilerplate",
  /* Brief description */
  "description": "Boilerplate for React.js components",
  /* Who is the author + optional email + optional site */
  "author": "Juho Vepsalainen <email goes here> (site goes here)",
  /* Version of the package */
  "version": "0.0.0",
  /* `npm run <name>` */
  "scripts": {
    "start": "webpack-dev-server",
    "test": "karma start",
    "tdd": "karma start --auto-watch --no-single-run",
    "gh-pages": "webpack",
    "deploy-gh-pages": "node ./lib/deploy_gh_pages.js",
    "dist": "webpack",
    "dist-min": "webpack",
    "dist-modules": "babel ./src --out-dir ./dist-modules",
    "lint": "eslint . --ext .js --ext .jsx",
    "preversion": "npm run test && npm run dist && npm run dist-min && git commit --allow-empty -am \"Update dist\"",
    "prepublish": "npm run dist-modules",
    "postpublish": "npm run gh-pages && npm run deploy-gh-pages"
  },
  /* Entry point for terminal (i.e., <package name>) */
  /* Don't set this unless you intend to allow CLI usage */
  "bin": "./index.js",
  /* Entry point (defaults to index.js) */
  "main": "dist-modules",
  /* Package dependencies */
  "dependencies": {
    "react": "^0.14.0",
    "react-dom": "^0.14.0"
  },
  /* Package development dependencies */
  "devDependencies": {
    "babel": "^5.8.23",
    "babel-core": "^5.8.25",
    "babel-eslint": "^4.1.3",
    ...
    "webpack": "^1.12.2",
    "webpack-dev-server": "^1.12.0",
    "webpack-merge": "^0.2.0"
  },
  /* Links to repository, homepage, and issue tracker */
  "repository": {
    "type": "git",
    "url": "https://github.com/bebraw/react-component-boilerplate.git"
  },
  "homepage": "https://bebraw.github.io/react-component-boilerplate/",
  "bugs": {
    "url": "https://github.com/bebraw/react-component-boilerplate/issues"
  },
  /* Keywords related to package,
   * fill this well to make the package searchable */
  "keywords": [
    "react",
    "reactjs",
    "boilerplate"
  ],
  /* Which license to use */
  "license": "MIT"
}
```

As you can see *package.json* can contain a lot of information. You can attach non-npm specific metadata there that can be used by tooling. Given this can bloat *package.json*, it may be preferable to keep metadata at files of their own.

## npm Workflow

Working with npm is surprisingly simple. To get started, you need to use [npm adduser](https://docs.npmjs.com/cli/adduser) (aliased to `npm login`). It allows you to set up an account. After this process has completed, it will create `~/.npmrc` and use that data for authentication. There's also [npm logout](https://docs.npmjs.com/cli/logout) that will clear the credentials.

### Publishing a Package

Provided you have logged in, creating new packages is just a matter of hitting `npm publish`. Given that the package name is still available and everything goes fine, you should have something out there! After this you can install your package through `npm install` or `npm i` as we've done so many times before in this book.

An alternative way to consume a library is to point at it directly in *package.json*. In that case you can do `"depName": "<github user>/<project>#<reference>"` where `<reference>` can be either commit hash, tag, or branch. This can be useful, especially if you need to hack around something and cannot wait for a fix.

Sometimes you might want to publish something preliminary for other people to test. In that case you can hit `npm publish --tag beta`. After that your users can install the tagged version using `npm i <your package name>@beta`.

T> It can be useful to use `npm link` during development. That will allow you to use a development version of your library from some other context. Node.js will resolve to the linked version unless local `node_modules` happens to contain a version.

### Respect the SemVer

Even though it is simple to publish new versions out there, it is important to respect the SemVer. Roughly it states that you should not break backwards compatibility given certain rules are met. For example, if your current version is `0.1.4` and you do a breaking change, you should bump to `0.2.0` and document the changes. You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

### On Naming Packages

Before starting to develop it can be a good idea to spend a little bit of time on figuring out a good name for your package. It's not very fun to write a great package just to notice the name has been taken. A good name is easy to find through a search engine, and most importantly, is available at npm.

As of npm 2.7.0 it is possible to create [scoped packages](https://docs.npmjs.com/getting-started/scoped-packages). They follow format `@username/project-name`. Simply follow that format when naming your project.

### Bumping a Version

Bumping a version is simple too. You'll just need to invoke `npm version <x.y.z>`. That will update *package.json* and create a version commit automatically. If you hit `npm publish`, you should have something new out there.

Note that in the example above I've set up `version` related hooks to make sure a version will contain a fresh version of a distribution build. I also run tests just in case.

## Library Formats

I output my React component in various formats at my boilerplate. I generate a version that's convenient to consume from Node.js by processing my component code through Babel. That will convert ES6 and other goodies to a format which is possible to consume from vanilla Node.js. This allows the user to refer to some specific module within the whole if needed.

In addition, I generate so called *distribution bundles*: `.js` and `.min.js`. There's a sourcemap (`.map`) useful for debugging for both. It is possible to consume these bundles standalone as they come with an [UMD](https://github.com/umdjs/umd) wrapper.

UMD makes it possible to consume them from various environments including global, AMD, and CommonJS (Node.js format). You can refresh your memory with these by checking the Getting Started chapter for examples.

It is surprisingly easy to generate the aforementioned bundles using Webpack. In the case of my boilerplate, the configuration is as follows:

```javascript
...

var commonDist = {
  devtool: 'source-map',
  output: {
    path: config.paths.dist,
    libraryTarget: 'umd',
    library: config.library
  },
  entry: config.paths.lib,
  externals: {
    react: 'react'
    /* more complicated mapping for lodash */
    /* we need to access it differently depending */
    /* on the environment */
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: '_',
      root: '_'
    }
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
};

if(TARGET === 'dist') {
  module.exports = merge(commonDist, {
    output: {
      filename: config.filename + '.js'
    },
  });
}

if(TARGET === 'dist-min') {
  module.exports = merge(commonDist, {
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
}
```

T> The example uses the same `merge` utility we defined earlier on. You should check [the boilerplate](https://github.com/bebraw/react-component-boilerplate) itself for the exact configuration.

Most of the magic happens thanks to `devtool` and `output` declarations. In addition, I have set up `externals` as I want to avoid bundling React and lodash into my library. Instead, both will be loaded as external dependencies using the naming defined in the mapping.

## npm Lifecycle Hooks

npm provides various lifecycle hooks that can be useful. Suppose you are authoring a React component using Babel and some of its goodies. You could let the *package.json* `main` field point at the UMD version as generated above. This won't be ideal for those consuming the library through npm, though.

It is better to generate a ES5 compatible version of the package for npm consumers. This can be achieved using **babel** CLI tool:

```bash
babel ./lib --out-dir ./dist-modules
```

This will walk through the `./lib` directory and output a processed file for each library it encounters to `./dist-modules`.

Since we want to avoid having to run the command directly whenever we publish a new version, we can connect it to `prepublish` hook like this:

```json
"scripts": {
  ...
  "prepublish": "babel ./lib --out-dir ./dist-modules"
}
```

Make sure you hit `npm i babel --save-dev` to include the tool into your project.

You probably don't want the directory content to end up in your Git repository. In order to avoid this and to keep your `git status` clean, consider this sort of `.gitignore`:

```bash
dist-modules/
...
```

Besides `prepublish`, npm provides a set of other hooks. The naming is always the same and follows the pattern `pre<hook>`, `<hook>`, `post<hook>` where `<hook>` can be `publish`, `install`, `test`, `stop`, `start`, `restart`, or `version`.

Even though npm will trigger scripts bound to these automatically, you can trigger them explicitly through `npm run` for testing (i.e., `npm run prepublish`). The idea here is that we want to make our package as easy to consume as possible. We can take one for our library users.

There are plenty of smaller tricks to learn for advanced usage. Those are better covered by [the official documentation](https://docs.npmjs.com/misc/scripts). Often all you need is just a `prepublish` script for build automation.

## Keeping Dependencies Up to Date

An important part of maintaining npm packages is keeping their dependencies up to date. How to do this depends a lot on the maturity of your package. Ideally you have a nice set of tests covering the functionality. If not, things can get a little hairier. There are a few ways to approach dependency updates:

* You can update all dependencies at once and hope for the best. Tools such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) can do this for you. Remember to invoke `npm i` afterward to make sure you have the right dependencies installed for testing the changes.
* Install the newest version of some specific dependency, e.g., `npm i lodash@* --save`. This is a more controlled way to approach the problem.
* Patch version information by hand by modifying *package.json* directly.

It is important to remember that your dependencies may introduce backwards incompatible changes. It can be useful to remember how SemVer works and study dependency release notes. They might not always exist, so you may have to go through the project commit history. There are a few services that can help you to keep track of your project dependencies:

* [David](https://david-dm.org/)
* [versioneye](https://www.versioneye.com/)
* [Gemnasium](https://gemnasium.com)

These services provide badges you can integrate into your project `README.md`. These services may email you about important changes. They can also point out possible security issues that have been fixed.

For testing your projects you can consider solutions such as [Travis CI](https://travis-ci.org/) or [SauceLabs](https://saucelabs.com/). [Coveralls](https://coveralls.io/) gives you code coverage information and a badge.

These services are valuable as they allow you to test your updates against a variety of platforms quickly. Something that might work on your system might not work in some specific configuration. You'll want to know about that as fast as possible to avoid introducing problems.

## Sharing Authorship

As packages evolve you may want to start developing with others. You could become the new maintainer of some project, or pass the torch to someone else. These things happen as packages evolve.

npm provides a few commands for these purposes. It's all behind `npm owner` namespace. More specifically you'll find `ls <package name>`, `add <user> <package name>` and `rm <user> <package name>` there (i.e., `npm owner ls`). That's about it.

See [npm documentation](https://docs.npmjs.com/cli/owner) for the most up to date information about the topic.

## Conclusion

You should have a basic idea on how to author npm libraries with the help of Webpack now. It takes a lot of effort out of the process. Just keep the basic rules in mind when developing and remember to respect the SemVer.
