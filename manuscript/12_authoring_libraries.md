# Authoring Libraries

[NPM](https://www.npmjs.com/) is one of the reasons behind the popularity of Node.js. It has become the package manager for JavaScript. Although initially it was used mostly for managing backend packages, it has become increasingly popular in frontend development. As you have seen so far it is easy to consume NPM packages using Webpack.

Eventually you might want to publish your own packages. You can consider our demo application a package of its own, sort of. We could even design applications to be pluggable so that you could glue them into a bigger whole. This would take some careful thought but in theory you could split everything up in smaller sections which you then knit together.

## Anatomy of a NPM Package

Most of NPM packages are small and include just a select few files such as:

* `index.js` - On small projects it's enough to have the code at the root. On larger ones you may want to start splitting it up further.
* `package.json` - NPM metadata in JSON format
* `README.md` - README is the most important document of your project. It is written in Markdown format and provides an overview. On simple projects whole documentation can fit there. It will be shown at the package page at `npmjs.com`.
* `LICENSE` - You should include licensing information within your project. You can refer to it from `package.json`.

In bigger projects you may find the following:

* `CONTRIBUTING.md` - A guide for potential contributors. How should the code be developed and so on.
* `CHANGELOG.md` - This document describes major changes per version. If you do major API changes, it can be a good idea to cover them here. It is possible to generate the file based on Git commit history provided you write nice enough commits.
* `.travis.yml` - [Travis CI](https://travis-ci.org/) is a popular continuous integration platform that is free for open source projects. You can run the tests of your package over multiple systems using it. There are other alternatives of course but Travis is very popular.
* `bower.json` - [Bower](http://bower.io/) specific metadata. Bower is a popular package manager for frontend. That said, just providing NPM support is often enough.
* `.gitignore` - Ignore patterns for Git. Ie. which file shouldn't go to version control.
* `.eslintignore` - Ignore patterns for ESlint. Again, tool specific.
* `.npmignore` - Ignore patterns for NPM. This describes which files shouldn't go to your distribution version.
* `.eslintrc` - Linting rules. You can use `.jshintrc` etc. based on your preferences.
* `webpack.config.js` - If you are using a simple setup, you might as well have the configuration at project root.

In addition you'll likely have various directories for source, tests, demos, documentation and so on.

## Understanding `package.json`

All packages come with a `package.json` that describes metadata related to them. This includes information about the author, various links, dependencies and so on. The [official documentation](https://docs.npmjs.com/files/package.json) covers them in detail.

I've annotated `package.json` of my [React component boilerplate](https://github.com/bebraw/react-component-boilerplate) below.

```json
{
  "name": "react-component-boilerplate", -- Name of the project
  "description": "Boilerplate for React.js components", -- Brief description
  "author": "Juho Vepsalainen <email goes here>", -- Who is the author + optional email
  "user": "bebraw", -- This is boilerplate specific (not used by NPM)
  "version": "0.0.0", -- Version of the package
  "scripts": { -- `npm run <name>`
    "start": "node dev-server/server.js",
    "test": "jest && npm run lint",
    ...
    "lint": "eslint . --ext .js --ext .jsx",
    "replace-meta": "node scripts/replace_meta.js"
  },
  "main": "dist-modules/index.js", -- Entry point (defaults to index.js)
  "dependencies": {}, -- Package dependencies (keep small if possible)
  "devDependencies": { -- Package development dependencies
    "babel": "^5.1.10",
    "babel-eslint": "^3.0.1",
    "babel-loader": "^5.0.0",
    ...
    "webpack": "^1.8.4",
    "webpack-dev-server": "^1.8.0"
  },
  -- You may want to give a rough dependency hint for things like React components
  -- The idea is to avoid depending directly and let user deal with it instead
  -- You should use a loose rule here
  "peerDependencies": {
    "react": ">=0.11.2 <1.0.0"
  },
  -- Links to repository, homepage and so on
  "repository": {
    "type": "git",
    "url": "https://github.com/bebraw/react-component-boilerplate.git"
  },
  "homepage": "https://bebraw.github.io/react-component-boilerplate/",
  "bugs": {
    "url": "https://github.com/bebraw/react-component-boilerplate/issues"
  },
  -- Keywords related to package, fill this well to make the package findable
  "keywords": [
    "react",
    "reactjs",
    "boilerplate"
  ],
  -- Which licenses are available
  "licenses": [
    {
      "type": "MIT",
      "url": "https://github.com/bebraw/react-component-boilerplate/blob/master/LICENSE"
    }
  ],
  -- Jest specific metadata
  "jest": {
    "scriptPreprocessor": "./config/preprocessor.js",
    "unmockedModulePathPatterns": [
      "./node_modules/react"
    ]
  }
}
```

As you can see `package.json` can contain a lot of information. You can attach non-NPM specific metadata there that can be used by tooling.

## NPM Workflow

Working with NPM is surprisingly simple. Provided you have created an account on the service and logged in once using [npm adduser](https://docs.npmjs.com/cli/adduser), all you need to do is to hit `npm publish`. Given that the package name is still available, you should have something out there!

T> Before starting to develop it can be a good idea to spend a little bit of time on that naming issue. It's not very fun to write an awesome package just to notice the name has been taken. Save some time and nerves by doing a little bit of research. With some luck you could find something fitting your purposes and avoid the chore of writing a library.

Bumping a version is simple too. You'll just need to invoke `npm version <x.y.z>`. That will update `package.json` and create a version commit automatically. If you hit `npm publish`, you should have something new out there.

T> It can be useful to use `npm link` during development. That will allow you to use a development version of your library from some other context. Node will resolve to the linked version unless local `node_modules` happens to contain a version.

Sometimes you might want to publish something preliminary for other people to test. In that case you can hit `npm publish <x.y.z> --tag beta`. After that your users can install the tagged version using `npm i <your package name>@beta`.

An alternative way to consume a library is to point at it directly at `package.json`. In that case you can do `"depName": "<github user>/<project>#<reference>"` where `<reference>` can be either commit hash, tag or branch. This can be useful especially if you need to hack around something and cannot wait for a fix.

## Respect the SemVer

Even though it is simple to publish new versions out there, it is important to respect the SemVer. Roughly it states that you should not break backwards compatibility given certain rules are met. Ie. if your current version is `0.1.4` and you do a breaking change, you should bump to `0.2.0` and document the changes. You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

## Library Formats

I output my React component in various formats at my boilerplate. I generate a version that's convenient to consume from Node by processing my component code through Babel. That will convert ES6 etc. goodies to a format which is possible to consume from vanilla Node. This allows the user to refer to some specific module within the whole if needed.

In addition I generate so called *distribution bundles*: `.js` and `.min.js`. In addition there's a sourcemap (`.map`) for both. That is useful for debugging. It is possible to consume these bundles standalone. They come with an [UMD](https://github.com/umdjs/umd) wrapper.

UMD makes it possible to consume them from various environments including global, AMD and CommonJS (Node format). You can refresh your memory with these by checking the Getting Started chapter for examples.

It is surprisingly easy to generate the aforementioned bundles using Webpack. In case of my boilerplate the configuration is as follows:

```javascript
...

var mergeDist = merge.bind(null, {
    devtool: 'source-map',
    output: {
        path: config.paths.dist,
        libraryTarget: 'umd',
        library: config.library,
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
                include: config.paths.lib,
            }
        ]
    }
});

exports.dist = mergeDist({
    output: {
        filename: config.filename + '.js',
    },
});

exports.distMin = mergeDist({
    output: {
        filename: config.filename + '.min.js',
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
        }),
    ],
});
```

T> The example uses the same `merge` utility we defined earlier on. You should check [the boilerplate](https://github.com/bebraw/react-component-boilerplate) itself for exact configuration.

Most of the magic happens thanks to `devtool` and `output` declarations. In addition I have set up `externals` as I want to avoid bundling React into my library. Instead if will be loaded as an external dependency using the naming defined in the mapping.

## Conclusion

You should have a basic idea on how to author NPM libraries with the help of Webpack now. It takes a lot of effort out of the process. Just keep the basic rules in mind when developing and remember to respect the SemVer.
