# Introduction

Front-end development moves forward fast. In this book we'll discuss  [Webpack](https://webpack.github.io/) and [React](https://facebook.github.io/react/). Combined, these tools allow you to build all sorts of web applications swiftly. Knowledge of Webpack is useful beyond React. Understanding React will allow you to see alternatives in a different light.

Webpack solves the fundamental problem of web development, namely module bundling. Webpack collects and processes a variety of web assets and packs them into a bundle that you can serve to your client. Even though this sounds simple, it is in fact a difficult problem that becomes more complex as your web application grows.

For example, let's say you have a form with a date input, and you want to use jQuery plugins for a date picker and validation, but you only want to include those plugins on specific pages. Webpack manages this module bundling scenario through configuration. This makes Webpack daunting to approach, yet powerful to use. This book helps you to get through that initial learning curve.

Facebook's React is a component based view abstraction. It is not limited to web. In fact, you can build mobile applications using it. React forces you to think your application as components. It won't be enough, though. You will need to complement it with some other libraries on more complex cases. Compared to a framework based approach, this is refreshing.

## How Is This Book Organized?

The idea of the book is to guide you through a small example project. After that we discuss more theoretical aspects of web development. The project in question will be a small [Kanban](https://en.wikipedia.org/wiki/Kanban) application. We will start by building a Webpack based configuration. After that we will develop a small clone of a famous [Todo application](http://todomvc.com/). We will generalize from there and put in place [Flux architecture](https://facebook.github.io/flux/docs/overview.html) within our application. Finally, we will apply some [DnD magic](https://gaearon.github.io/react-dnd/) and start dragging things around.

The theoretical parts of the book focus more on the tooling. Through those you will learn to:

* lint your code effectively using [ESLint](http://eslint.org/) and some other tools
* author libraries at [npm](https://www.npmjs.com/)
* style React in various emerging ways

## What is Kanban?

![Kanban by Dennis Hamilton (CC BY)](images/kanban_intro.jpg)

Kanban, originally developed at Toyota, allows you to track the status of tasks. It can be modeled as `Lanes` and `Notes`. `Notes` move through `Lanes` representing stages from left to right as they become completed. `Notes` themselves can contain information about the task itself, priority and so on.

The simplest way to build a Kanban is to get a bunch of post-it notes and find a wall. After that you split it up in columns. These `Lanes` could consist of the following stages: Todo, Doing, Done. All `Notes` would go to Todo initially. As you begin working on them you would move them to Doing and finally, to Done when completed. This is the simplest way to get started.

As the system gets more sophisticated you can start applying concepts such as WIP limit. The effect of this is that you are forced to focus on getting that particular task done. That is one of the good consequences of using Kanban. Moving those notes around is satisfying. As a bonus you get visibility and know what is yet to be done.

A good idea to see Kanban in action at the web is to check out [Trello](https://trello.com/). Sprintly has open sourced their [React implementation of Kanban](https://github.com/sprintly/sprintly-kanban). Ours won't be as sophisticated, but it will be enough to get started.

## Who Is This Book For?

I expect that you have a basic knowledge of JavaScript and Node.js. You should be able to use npm. If you know something about Webpack or React, that's great. By reading this book you will deepen your understanding of these tools.
## Extra Material

The book content and source are available at [GitHub](https://github.com/survivejs/webpack_react). This allows you to start from any chapter you want.

## Getting Support

As no book is perfect, you will likely come by issues and might have some questions related to the content. There are a couple of options:

* [GitHub Issue Tracker](https://github.com/survivejs/webpack_react/issues)
* [Gitter Chat](https://gitter.im/survivejs/webpack_react)
* Twitter - @survivejs or poke me through @bebraw
* Email - bebraw@gmail.com

If you post questions to Stack Overflow, tag them using `survivejs` so I will get notified of them.

I have tried to cover some common issues at the `Troubleshooting` appendix. That will be expanded as common problems are found.

## Announcements

I announce SurviveJS related news through a couple of channels:

* [Mailing list](http://eepurl.com/bth1v5)
* [Twitter](https://twitter.com/survivejs)
* [Blog RSS](http://survivejs.com/atom.xml)

Feel free to subscribe.

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for starting the [react-webpack-cookbook](https://github.com/christianalfoni/react-webpack-cookbook) with me. That work eventually lead to this book.

The book wouldn't be half as good as it is without patient editing and feedback by my editor [Jesús Rodríguez Rodríguez](https://github.com/Foxandxss). Thank you.

Special thanks to Ava Mallory and EditorNancy from fiverr.com.

Numerous individuals have provided support and feedback along the way. Thank you in no particular order Christian Alfoni, Vitaliy Kotov, @af7, Dan Abramov, @dnmd, James Cavanaugh, Josh Perez, Nicholas C. Zakas, Ilya Volodin, Jan Nicklas, Daniel de la Cruz, Robert Smith, Andreas Eldh, Brandon Tilley, Braden Evans, Daniele Zannotti, Partick Forringer, Rafael Xavier de Souza, Dennis Bunskoek, Ross Mackay, Jimmy Jia, Michael Bodnarchuk, Ronald Borman, Guy Ellis, Mark Penner, Cory House, Sander Wapstra, Nick Ostrovsky, Oleg Chiruhin, Matt Brookes, Devin Pastoor, Yoni Weisbrod, Jesús Rodríguez Rodríguez, Guyon Moree, Wilson Mock, Herryanto Siatono, Héctor Cascos, Erick Bazán, Fabio Bedini, Gunnari Auvinen, Aaron McLeod, John Nguyen, Hasitha Liyanage, Mark Holmes, Brandon Dail, Ahmed Kamal, Jordan Harband, Michel Weststrate, Steve Piercy, Ives van Hoorne and Luca DeCaprio. If I'm missing your name, I might have forgotten to add it.
