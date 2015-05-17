[![Join the chat at https://gitter.im/survivejs/webpack_react](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/survivejs/webpack_react?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) <a href="https://gratipay.com/bebraw/"><img src="https://img.shields.io/gratipay/bebraw.svg"></a> [![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bebraw&url=https://github.com/survivejs/webpack_react&title=SurviveJS - Webpack and React&language=&tags=github&category=software)

# SurviveJS - Webpack and React

<img align="right" width="124" height="180" src="manuscript/images/title_page_small.jpg">

> **IMPORTANT!** If you want to support the development of this book, you can either [purchase a copy at Leanpub](https://leanpub.com/survivejs_webpack) or [use gratipay](https://gratipay.com/bebraw/). In case either won't work for reason or another, hit me through email. Feedback and word of mouth is valuable as well!

Webpack, a module bundler, solves a significant problem for web developers. It can be daunting to learn but once you grok it, life gets easier. Same goes for React, a JavaScript library for building UIs. This book shows you how to build a little Kanban application using these technologies. During the process you will learn the basics and will be able to take the skills to your own projects.

## How to Use This Repository?

The repository has been split in two main parts: `manuscript` and `project_source`. You can find the book in its entirety under `manuscript` organized per chapter. `project_source` contains source associated to each chapter.

There is no single right way to approach the book. It depends on your experience level and interest. You can build the project from scratch by following the book or you can start from a specific stage. Just pick the source from previous chapter as your starting point.

## Progress

The following tables should give you some idea of the status of the project and planned content.

**Core Chapters**

These are guaranteed to go into the first stable release.

Chapter | Description | Progress
--- | --- | ---
Introduction | Brief intro to book, how to use it and so on | 75%
Webpack Compared | How Webpack differs from the rest | 90%
Developing with Webpack | How to get started with Webpack | 90%
Linting in Webpack | How to lint in Webpack | 90%
Webpack and React | How to develop React with Webpack | 90%
Implementing a Basic Note App | First steps with React | 90%
React and Flux | Improving architecture by using Flux (Alt) | 90%
From Notes to Kanban | Integrating Baobab | 65%
Styling React | Styling application | 90%
Polishing Kanban | Adding DnD | 20%
Deploying Applications | How to deal with various deployment configurations | 30% | This needs a partial rewrite
Authoring Libraries | How to author libraries at NPM using Webpack | 90%

**Bonus Chapters**

These depend on how well the book manages.

Chapter | Description | Progress | Notes
--- | --- | --- | ---
Routing with react-router | Extending further (multiple boards, charts) | 0% | It might be nice to discuss routing and expand the app while at it
Backend | This would discuss the usage of Webpack on backend. REST API on top of Express and Swagger? | 5% | [Tech demo](https://github.com/bebraw/swagger-todo)
Isomorphism | How to go isomorphic with the app. Discuss benefits and possible gotchas. | 0% |
Performance | Performance strategies for Webpack and React | 0% | |
Testing | Testing approaches/tools for Webpack and React | 0% | |
Internationalization etc. | i18n/l10n/a11y | 0% | Gathering ideas
Asset Management | How to deal with various assets | 10% | This might go away (integrated to others)
Debugging Webpack | Various debugging strategies for Webpack | 0% | Need to go through various strategies and develop tooling

## Contributing

Feedback is welcome. You can provide it through [the issue tracker](https://github.com/survivejs/webpack_react/issues).

## Generating Ebooks

To generate a pdf version of the book, hit `npm install` and `npm start`. After that you should have `./book.pdf`.

## License

CC BY-NC-ND.
