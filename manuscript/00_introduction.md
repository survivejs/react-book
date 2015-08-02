# Introduction

Frontend development moves forward fast. The main purpose of this book is to help you to get up to speed with two emerging tools: [webpack](https://webpack.github.io/) and [React](https://facebook.github.io/react/). Combined these tools allow you to build all sorts of web applications swiftly. Knowledge of webpack is useful beyond React. And understanding React will provide you insight that allows you to see alternatives in a different light.

Webpack solves the fundamental problem of web development, namely bundling. It takes in a variety of assets and provides you something you can serve to your client. Even though this sounds simple it is in fact a difficult problem. Webpack manages it through configuration. This makes it daunting to approach but powerful to use. This book helps you to get through that learning curve.

Facebook's React is a component based view abstraction. It is not limited to web. In fact you can build mobile applications using it. React forces you to think your application in terms of components. It won't be enough, though, and you will need to complement it with some other libraries on more complex cases. Compared to framework based approach this is refreshing.

## How Is This Book Organized?

The idea of the book is to guide you through a small example project and then discuss more theoretical aspects of web development. The project in question will be a small [Kanban](https://en.wikipedia.org/wiki/Kanban) application. We will start by building a webpack based configuration. After that we will develop a small clone of a famous [Todo application](http://todomvc.com/). We will generalize from there and implement [Flux architecture](http://alt.js.org/) within our application. Finally we will apply some [DnD magic](https://gaearon.github.io/react-dnd/) so that you can begin dragging things around.

Theoretical parts of the book will focus more on the tooling. Through those you will learn to:

* lint your code effectively using [ESLint](http://eslint.org/) and some other tools
* develop a build configuration for deployment
* author libraries at [npm](https://www.npmjs.com/)
* style React in various emerging ways

## What is Kanban?

![Kanban by Dennis Hamilton (CC BY)](images/kanban_intro.jpg)

Kanban, originally developed at Toyota, allows you to track the status of tasks. It can be modeled in terms of `Lanes` and `Notes`. `Notes` move through `Lanes` representing stages from left to right as they become completed. `Notes` themselves can contain information about the task itself, priority and so on.

The simplest way to build a Kanban is to get a bunch of post-it notes and find a wall. `Lanes` could consist of the following stages: Todo, Doing, Done. All `Notes` would go to Todo initially. As you begin working on them you would move them to Doing and finally to Done when completed. This is the simplest way to get started.

As the system gets more sophisticated you could start applying concepts such as WIP limit. This would mean you would restrict the amount of maximum work at Doing. The effect of this is that you would be forced to focus on getting that particular task done. That is one of the good consequences of using Kanban. Moving those notes around is satisfying. As a bonus you get visibility and know what is yet to be done.

A good idea to see Kanban in action at the web is to check out [Trello](https://trello.com/). Sprintly has open sourced their [React implementation of Kanban](https://github.com/sprintly/sprintly-kanban). Ours won't be as sophisticated but it will be enough to get started.

## Who Is This Book For?

I expect that you have a basic knowledge of JavaScript and Node.js. You should be able to use npm. If you know something about webpack or React, that's great. That said, you should be able to deepen your understanding of these tools by reading this book and going through the project.

## Additional Material

The book content and source are available at [GitHub](https://github.com/survivejs/webpack_react). Even though it is recommended you will work through the material and experiment as you go, you can also just pick a starting point from there and then work on it instead. This is useful especially if you master basics already. Or in case you want to skip the React part.

## Getting Support

As no book is perfect you will likely come by issues and might have some questions related to content. There are a couple of options:

* [GitHub Issue Tracker](https://github.com/survivejs/webpack_react/issues)
* [Gitter Chat](https://gitter.im/survivejs/webpack_react)
* Twitter - @survivejs or poke me directly using @bebraw
* Email - bebraw@gmail.com

In case you post questions to Stack Overflow, please tag them using `survivejs` so I will get notified of them.

I have tried to cover some common issues at the `Troubleshooting` appendix. That will be expanded as common problems are revealed.

## Announcements

I announce SurviveJS related news through a couple of channels:

* [Mailing list](http://eepurl.com/bth1v5)
* [Twitter](https://twitter.com/survivejs)
* [Blog RSS](http://survivejs.com/atom.xml)

Feel free to subscribe.

## Acknowledgments

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for starting [react-webpack-cookbook](https://github.com/christianalfoni/react-webpack-cookbook) with me. That work eventually lead to this book.

The book wouldn't be half as good as it is without patient editing and feedback by my editor [Jesús Rodríguez Rodríguez](https://github.com/Foxandxss). Thank you.

Numerous individuals have provided support and feedback along the way. Thank you in no particular order Christian Alfoni, Vitaliy Kotov, @af7, Dan Abramov, @dnmd, James Cavanaugh, Josh Perez, Nicholas C. Zakas, Ilya Volodin, Jan Nicklas, Daniel de la Cruz, Robert Smith, Andreas Eldh, Brandon Tilley, Braden Evans, Daniele Zannotti, Partick Forringer, Rafael Xavier de Souza, Dennis Bunskoek, Ross Mackay, Jimmy Jia, Michael Bodnarchuk, Ronald Borman, Guy Ellis, Mark Penner, Cory House, Sander Wapstra, Nick Ostrovsky, Oleg Chiruhin, Matt Brookes, Devin Pastoor, Yoni Weisbrod, Jesús Rodríguez Rodríguez, Guyon Moree, Wilson Mock, Herryanto Siatono, Héctor Cascos, Erick Bazán, Fabio Bedini, Gunnari Auvinen, Aaron McLeod, John Nguyen, Hasitha Liyanage and Mark Holmes. If I'm missing your name, I probably forgot to add it.
