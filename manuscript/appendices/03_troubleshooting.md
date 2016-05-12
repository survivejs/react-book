# Troubleshooting

I've tried to cover some common issues here. This chapter will be expanded as common issues are found.

## `EPEERINVALID`

It is possible you may see a message like this:

```bash
npm WARN package.json kanban_app@0.0.0 No repository field.
npm WARN package.json kanban_app@0.0.0 No README data
npm WARN peerDependencies The peer dependency eslint@0.21 - 0.23 included from eslint-loader will no
npm WARN peerDependencies longer be automatically installed to fulfill the peerDependency
npm WARN peerDependencies in npm 3+. Your application will need to depend on it explicitly.

...

npm ERR! Darwin 14.3.0
npm ERR! argv "node" "/usr/local/bin/npm" "i"
npm ERR! node v0.10.38
npm ERR! npm  v2.11.0
npm ERR! code EPEERINVALID

npm ERR! peerinvalid The package eslint does not satisfy its siblings' peerDependencies requirements!
npm ERR! peerinvalid Peer eslint-plugin-react@2.5.2 wants eslint@>=0.8.0
npm ERR! peerinvalid Peer eslint-loader@0.14.0 wants eslint@0.21 - 0.23

npm ERR! Please include the following file with any support request:
...
```

In human terms, it means that some package, `eslint-loader` in this case, has a too strict `peerDependency` requirement. Our project has a newer version installed already. Given the required peer dependency is older than our version, we get this particular error.

There are a couple of ways to work around this:

1. Report the glitch to the package author and hope the version range will be expanded.
2. Resolve the conflict by settling to a version that satisfies the peer dependency. In this case, we could pin `eslint` to version `0.23` (`"eslint": "0.23"`), and everyone should be happy.
3. Fork the package, fix the version range, and point at your custom version. In this case, you would have a `"<package>": "<github user>/<project>#<reference>"` kind of declaration for your dependencies.

T> Note that peer dependencies are dealt with differently starting from npm 3. After that version, it's up to the package consumer (i.e., you) to deal with it. This particular error will go away.

## Warning: setState(...): Cannot update during an existing state transition

You might get this warning while using React. An easy way to end up getting it is to trigger `setState()` within a method, such as `render()`. Sometimes this can happen indirectly. One way to cause the warning is call a method instead of binding it. Example: `<input onKeyPress={this.checkEnter()} />`. Assuming `this.checkEnter` uses `setState()`, this code will fail. Instead, you should use `<input onKeyPress={this.checkEnter} />` as that will bind the method correctly without calling it.

## Warning: React attempted to reuse markup in a container but the checksum was invalid

You can get this warning through multiple means. Common causes below:

* You tried to mount React multiple times to the same container. Check your script loading and make sure your application is loaded only once.
* The existing markup on your template doesn't match the one rendered by React. This can happen especially if you are rendering the initial markup through a server.

## `Module parse failed`

When using Webpack, an error like this might come up:

```bash
ERROR in ./app/components/Demo.jsx
Module parse failed: .../app/components/Demo.jsx Line 16: Unexpected token <
```

This means there is something preventing Webpack to interpret the file correctly. You should check out your `loader` configuration carefully. Make sure the right loaders are applied to the right files. If you are using `include`, you should verify that the file is included within `include` paths.

## Project Fails to Compile

Even though everything should work in theory, sometimes version ranges can bite you, despite SemVer. If some core package breaks, let's say `babel`, and you happen to execute `npm i` in an unfortunate time, you may end up with a project that doesn't compile.

A good first step is to execute `npm update`. This will check out your dependencies and pull the newest matching versions into your SemVer declarations. If this doesn't fix the issue, you can try to nuke `node_modules` (`rm -rf node_modules`) from the project directory and reinstall the dependencies (`npm i`). Alternatively you can try to explicitly pin some of your dependencies to specific versions.

Often you are not alone with your problem. Therefore, it may be worth your while to check out the project issue trackers to see what's going on. You can likely find a good workaround or a proposed fix there. These issues tend to get fixed fast for popular projects.

In a production environment, it may be preferable to lock production dependencies using `npm shrinkwrap`. [The official documentation](https://docs.npmjs.com/cli/shrinkwrap) goes into more detail on the topic.
