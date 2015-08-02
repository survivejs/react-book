[![Join the chat at https://gitter.im/survivejs/webpack_react](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/survivejs/webpack_react?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# SurviveJS - Webpack and React

<img align="right" width="124" height="180" src="manuscript/images/title_page_small.jpg">

> **IMPORTANT!** If you want to support the development of this book, you can [purchase a copy at Leanpub](https://leanpub.com/survivejs_webpack). Feedback is valuable as well.

webpack, a module bundler, solves a significant problem for web developers. It can be daunting to learn but once you grok it, life gets easier. Same goes for React, a JavaScript library for building UIs. This book shows you how to build a little Kanban application using these technologies. During the process you will learn the basics and will be able to take the skills to your own projects.

## How to Use This Repository?

The repository has been split in two main parts: `manuscript` and `project_source`. You can find the book in its entirety under `manuscript` organized per chapter. `project_source` contains source associated to each chapter.

There is no single right way to approach the book. It depends on your experience level and interest. You can build the project from scratch by following the book or you can start from a specific stage. Just pick the source from previous chapter as your starting point.

## Bonus Chapters?

It is possible new content will be developed to the book. This depends on your support. You can see some potential ideas below.

Chapter | Description | Progress | Notes
--- | --- | --- | ---
Routing with react-router | Extending further (multiple boards, charts) | 0% | It might be nice to discuss routing and expand the app while at it
Backend | This would discuss the usage of webpack on backend. REST API on top of Express and Swagger? | 5% | [Tech demo](https://github.com/bebraw/swagger-todo)
Isomorphism | How to go isomorphic with the app. Discuss benefits and possible gotchas. | 0% |
Performance | Performance strategies for webpack and React | 0% | |
Testing | Testing approaches/tools for webpack and React | 0% | |
Internationalization etc. | i18n/l10n/a11y | 0% | Gathering ideas
Debugging webpack | Various debugging strategies for webpack | 0% | Need to go through various strategies and develop tooling
Data trees (baobab) | How to port the application to Baobab | 0% | I had some material on this initially but went with Alt instead as it felt simpler and more fitting for the book

## Contributing

Feedback is welcome. You can provide it through [the issue tracker](https://github.com/survivejs/webpack_react/issues).

## Generating Ebooks

It is possible to generate an ebook version through Calibre. Make sure you have it installed before trying the generation script. You can get it from [Calibre site](http://calibre-ebook.com/download) or alternatively you can use the package manager of your operating system (Homebrew-cask for Mac, `sudo apt-get install calibre calibre-bin` for Ubuntu). If you use Homebrew-cask, you may need to add the Calibre CLI to your PATH (e.g. `export PATH=$PATH://opt/homebrew-cask/Caskroom/calibre/2.31.0/calibre.app/Contents/MacOS`).

To generate a pdf version of the book, hit `npm install` and `npm start`. After that you should have `./book.pdf`.

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/3.0/88x31.png" /></a>
