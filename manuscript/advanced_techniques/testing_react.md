# Testing React

In order to encourage people to support my work, I've decided to publish a TL;DR version of this chapter for the community. This will allow me to develop more content, so it's a win-win really.

You can access the full chapter by buying a copy through [Leanpub](https://leanpub.com/survivejs_react). It goes into detail, whereas the following should give you a rough idea of the chapter contents.

## TL;DR

* Basic testing techniques include unit testing, acceptance testing, property based testing, and mutation testing.
* Unit testing allows us to ascertain *specific* certain truths.
* Acceptance testing allows us to test qualitative aspects of our system.
* Property based testing (see [QuickCheck](https://hackage.haskell.org/package/QuickCheck)) is more generic and allows us to cover a wider range of values more easily. These tests are more difficult to write, though.
* Mutation testing makes it possible to test the tests. Unfortunately, it's not a particularly popular technique with JavaScript yet.
* Cesar Andreu's [web-app](https://github.com/cesarandreu/web-app) has a nice testing setup (Mocha/Karma/Istanbul).
* Code coverage helps us to understand what parts of the code remain untested. It does not, however, give us any guarantees of the quality of our tests.
* [React Test Utilities](https://facebook.github.io/react/docs/test-utils.html) give us a nice way to write unit tests for components. There are lighter APIs, such as [jquense/react-testutil-query](https://github.com/jquense/react-testutil-query).
* Alt provides a good means for testing [actions](http://alt.js.org/docs/testing/actions/) and [stores](http://alt.js.org/docs/testing/stores/).
* Testing provides you confidence. This will become particularly important as your codebase grows. It will become harder to break things inadvertently.

> [Buy the book](https://leanpub.com/survivejs_react) for more detail.
