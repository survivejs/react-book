# Build with Webpack -- Guide to Bundling

This is the private repo for possible commercial version of the book. I've split it up in a couple of parts:

* TOC.md - Proposed table of contents with brief descriptions
* <section>*.md - Full section

To generate a pdf version of the book, hit `npm install` and `npm start`. After that you should have `book.pdf` at the project root.


## Save this for later

## Loading Vendors from CDN

The best way to load data is not to load it. If the data is already at a client, it can be reused. CDNs build on this idea. There are a variety of public CDNs that host a variety of popular JavaScript libraries. If you users have already visited on some site using the same libraries as you are, it is possible they are already cached.

Another advantage is that CDNs rely on distributed server architecture and may be able to serve the libraries much faster than a single server somewhere might. Of course if you are running your app in a distributed manner it might not matter as much. But often you are not. 

- XXX: need to verify this statement somehow

There are gotchas with this approach. The CDN provider might be down. It is not a likely scenario but it is still possible. This scenario is disastrous from the client’s point of view. Therefore it makes sense to have a local fallback in place.

We can use this approach with Webpack by using `externals` configuration. It makes sure the libraries are not included in the build. In addition we’ll need to write a little bit of HTML that points to the fallback. Here is a sample of how externals work:

```javascript
{
  externals: {
    // require("jquery") is external and available on the global var jQuery
    "jquery": "jQuery"
  }
}
```

```
if (!window.jQuery) {
  require.ensure([], function () {
    require(‘jquery’);
  });
}
```

http://stackoverflow.com/a/22619421/228885 - externals work

- XXX: explain the HTML bit, I’ve generated it using some Gulp plugin myself. might be out of scope for Webpack so external solution might be needed here. https://www.npmjs.com/package/html-webpack-plugin could be improved for this purpose but it doesn’t have the functionality yet
