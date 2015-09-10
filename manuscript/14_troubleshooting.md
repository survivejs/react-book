# Troubleshooting

I've tried to cover some common issues here. This chapter will be expanded as common issues are found.

## `EPEERINVALID`

It is possible you may see a message like this:

```
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

In human terms it means that some package, `eslint-loader` in this case, has too strict `peerDependency` requirement. Our project has a newer version installed already. Given the required peer dependency is older than our version we get this particular error.

There are a couple of ways to work around this:

1. Report the package author about the glitch and hope the version range will be expanded.
2. Resolve the conflict by settling to a version that satisfies the peer dependency. I.e. in this case, we could fix `eslint` to version `0.23` (`"eslint": "0.23"`) and everyone should be happy.
3. Fork the package, fix the version range and point at your custom version. In this case, you would have `"<package>": "<github user>/<project>#<reference>"` kind of declaration at your dependencies.

T> Note that peer dependencies will be dealt with differently starting with npm 3. After that it's up to the package consumer (i.e. you) to deal with it. This particular error will go away.

## Project Fails to Compile

Even though everything should work in theory sometimes version ranges can bite despite semver. If some core package, say `babel`, breaks, and you happen to hit `npm i` at an unfortunate time, you may end up with a project that doesn't compile.

As a first step it can be a good idea to nuke `node_modules` (`rm -rf node_modules`) from the project directory and reinstall the dependencies (`npm i`). That may fix the problem. Alternatively, you can try to explicitly lock some of your dependencies to specific versions.

In production environment it may be preferable to lock production dependencies using `npm shrinkwrap`. [The official documentation](https://docs.npmjs.com/cli/shrinkwrap) goes into more detail at the topic.