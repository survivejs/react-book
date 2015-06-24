# Introduction

Back in the day it was enough to understand how Makefiles work. That said even today Make is a viable tool. During the past few years we have seen many new tools come and go especially in the realm of frontend development. First Grunt became popular. Shortly after that Gulp gained momentum. These tools help a lot but they still don't solve some fundamental issues. That is where solutions such as [Browserify](http://browserify.org/) and [Webpack](https://webpack.github.io/) come in.

They don't aim to replace more general utilities such as [Grunt](http://gruntjs.com/) or [Gulp](http://gulpjs.com/). Rather they complement them. In this book we will focus primarily on Webpack, a module bundler. It is simply a tool that takes some input, bundles it and provides you something to serve to your clients. Even though this sounds simple, Webpack solves a fundamental problem for web developers.

Previously you had to use numerous separate tools for compiling your assets. Webpack does this transparently for you. It is not just about Javascript. You can use it to bundle pretty much anything thanks to its loader based architecture. You can easily consume JSON, images and even fonts. Not only that, we can process these assets through transpilers, Base64 conversion etc. without much trouble.

## How Is This Book Organized?

We will start from zero and develop a little Kanban application for tracking projects. During the process you will learn a lot about Webpack and a bit of [React](https://facebook.github.io/react/). Facebook's React has changed the way we think about frontend development. As it happens Webpack is a very good fit with React. We will also discuss Webpack on the backend and access some nifty language features that might not be otherwise available for us.

## Who Is This Book For?

It is expected that you have basic knowledge of JavaScript and Node.js. You should be able to use npm. If you know something about Webpack or React, that's great. That said, you should be able to deepen your understanding of the tool by reading this book and going through the project.

Once you understand the power of Tobias Koppers' tool, it will help you to reach the next level of productivity as a web developer. You will be able to implement and optimize your web application in ways that were hard previously. And what's better, you will be able to develop more effectively. Thank you Tobias, and other contributors of Webpack, for easing our lives as developers!

## Additional Material

The book content and source is available at [GitHub](https://github.com/survivejs/webpack_react). Even though it is recommended you will work through the material and experiment as you go, you can also just pick a starting point from there and then work on it instead. This is useful especially if you master basics already. Or in case you want to skip the React part.

In case you want infrequent updates about the book, I recommend following [@survivejs](https://twitter.com/survivejs) at Twitter.

## Getting Support

As no book is perfect you will likely come by issues and might have some questions related to content. There are a couple of options:

* [GitHub Issue Tracker](https://github.com/survivejs/webpack_react/issues)
* [Gitter Chat](https://gitter.im/survivejs/webpack_react)
* Twitter - @survivejs or poke me directly using @bebraw
* Email - bebraw@gmail.com

## Acknowledgments

This book wouldn't have been possible without these individuals. They all helped to make it better, each in their own way. Thanks guys!

* Christian Alfoni - @christianalfoni - Helped to author [react-webpack-cookbook](https://github.com/christianalfoni/react-webpack-cookbook). This book is continuation to that effort.
* @vitaliy-kotov - Pointed out various issues
* @af7 - Typo fixes and feedback
* Dan Abramov - @gaearon - Feedback and awesome tooling
* @dnmd - Pointed out Windows related path issue
* James Cavanaugh - @PlantBuilder - Pointed out various typos and provided useful feedback
* Josh Perez - @goatslacker - Helped to improve Alt chapter
* Nicholas C. Zakas - @nzakas - Helped to improve linting chapter
* Ilya Volodin - @ilyavolodin - Helped to improve linting chapter
* Jan Nicklas - @jantimon - Helper to improve `html-webpack-plugin` related configuration a lot
* Daniel de la Cruz - @danderu - Removed redundant reference to `.tpl`
* Robert Smith - @rbrtsmith - Pointed out issues at Developing with Webpack
* Andreas Eldh - @eldh - Helped to develop Antwar, the tool that's powering the book's site. Also helped immensely with the base theme
* Brandon Tilley - @binarymuse - Gave some well needed inspiration for drag and drop implementation
* Braden Evans - @braden - Pointed out site related horizontal scrollbar issue
