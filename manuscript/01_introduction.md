# Introduction

Front-end development moves forward fast. A good indication of this is the pace at which new technologies appear to the scene. [React](https://facebook.github.io/react/) is one of these recent newcomers. Even though the technology itself is simple, there's a lot going on around it.

The purpose of this book is to help you get started with React and provide understanding of the surrounding ecosystem so you know where to look.

Our development setup is based on Webpack. There's [a separate book](http://survivejs.com/webpack/introduction/) that digs into it, but I don't expect you to understand Webpack well to get through this book.

## What is React?

Facebook's React, a JavaScript library, is a component based view abstraction. A component could be a form input, button, or any other element in your user interface. This provides an interesting contrast to earlier approaches as React isn't bound to the DOM by design. You can use it to implement mobile applications for example.

### React is Only One Part of the Whole

Given React focuses only on the view, you'll likely have to complement it with other libraries to give you the missing bits. This provides an interesting contrast to framework based approaches as they give you a lot more out of the box. Both approaches have their merits. In this book, we will focus on the library oriented approach.

Ideas introduced by React have influenced the development of the frameworks. Most importantly it has helped us to understand how well component based thinking fits web applications.

## What Will You Learn?

![Kanban application](images/kanban_05.png)

This book teaches you to build a [Kanban](https://en.wikipedia.org/wiki/Kanban) application. Beyond this, more theoretical aspects of web development are discussed. Completing the project gives you a good idea of how to implement something on your own. During the process you will learn why certain libraries are useful and will be able to justify your technology choices better.

## How is This Book Organized?

To get started, we will develop a small clone of a famous [Todo application](http://todomvc.com/). This leads us to problems of scaling. Sometimes, you need to do things the dumb way to understand why better solutions are needed after all.

We will generalize from there and put [Flux architecture](https://facebook.github.io/flux/docs/overview.html) in place. We will apply some [Drag and Drop (DnD) magic](https://gaearon.github.io/react-dnd/) and start dragging things around. Finally, we will get a production grade build done.

The final, theoretical part of the book covers more advanced topics. If you are reading the commercial edition of this book, there's something extra in it for you. I will show you how to deal with typing in React in order to produce higher quality code. You will also learn to test your components and logic. You will learn to style your React application in emerging ways and have a better idea of how to structure your project.

The appendices at the end are meant to give food for thought and explain aspects, such as language features, in greater detail. If there's a bit of syntax that seems weird to you in the book, you'll likely find more information there.

## What is Kanban?

![Kanban by Dennis Hamilton (CC BY)](images/kanban_intro.jpg)

Kanban, originally developed at Toyota, allows you to track the status of tasks. It can be modeled in terms of `Lanes` and `Notes`. `Notes` move through `Lanes` representing stages from left to right as they become completed. `Notes` themselves can contain information about the task itself, its priority, and so on as required.

The system can be extended in various ways. One simple way is to apply a Work In Progress (WIP) limit per lane. The effect of this is that you are forced to focus on getting tasks done. That is one of the good consequences of using Kanban. Moving those notes around is satisfying. As a bonus you get visibility and know what is yet to be done.

### Where to Use Kanban?

This system can be used for various purposes, including software and life management. You could use it to track your personal projects or life goals for instance. Even though it's a simple tool, it's quite powerful, and you can find use for it in many places.

### How to Build a Kanban?

The simplest way to build a Kanban is to get a bunch of Post-it notes and find a wall. After that, you split it up into columns. These `Lanes` could consist of the following stages: Todo, Doing, Done. All `Notes` would go to Todo initially. As you begin working on them, you would move them to Doing, and finally, to Done when completed. This is the simplest way to get started.

This is just one example of a lane configuration. The lanes can be configured to match your process. There can be approval steps for instance. If you are modeling a software development process, you could have separate lanes for testing and deployment for instance.

### Available Kanban Implementations

[Trello](https://trello.com/) is perhaps the most known online implementation of Kanban. Sprintly has open sourced their [React implementation of Kanban](https://github.com/sprintly/sprintly-kanban). Meteor based [wekan](https://github.com/wekan/wekan) is another good example. Ours won't be as sophisticated as these, but it will be enough to get started.

## Who is This Book for?

I expect that you have a basic knowledge of JavaScript and Node.js. You should be able to use npm on an elementary level. If you know something about React, or ES6, that's great. By reading this book you will deepen your understanding of these technologies.

One of the hardest things about writing a book is to write it on the right level. Given the book covers a lot of ground, there are appendices that cover basic topics, such as language details, with greater detail than the main content does. So if you are feeling unsure of something, check them out.

There's also a [community chat](https://gitter.im/survivejs/react) available. If you want to ask something directly, we are there to help. Any comments you might have will go towards improving the book content. The last thing I want is to have someone struggling with the book.

## How to Approach the Book?

Although a natural way to read a book is to start from the first chapter and then read the chapters sequentially, that's not the only way to approach this book. The chapter order is just a reading suggestion. Depending on your background, you could consider skimming through the first part and then digging deeper into the advanced topics.

The book doesn't cover everything you need to know in order to develop front-end applications. That's simply too much for a single book. I do believe, however, that it might be able to push you in the right direction. The ecosystem around React is fairly large and I've done my best to cover a good chunk of it.

Given the book relies on a variety of new language features, I've gathered the most important ones used to a separate *Language Features* appendix that provides a quick look at them. If you want to understand the features in isolation or feel unsure of something, that's a good place to look.

## Book Versioning

As this book receives a fair amount of maintenance and improvements due to the pace of innovation, there's a rough versioning scheme in place. I maintain release notes for each new version at the [book blog](http://survivejs.com/blog/) to describe what has changed between versions. Also examining the GitHub repository may be beneficial. I recommend using the GitHub *compare* tool for this purpose. Example:

```
https://github.com/survivejs/react/compare/v2.1.0...v2.5.11
```

The page will show you the individual commits that went to the project between the given version range. You can also see the lines that have changed in the book. This excludes the private chapters, but it's enough to give you a good idea of the major changes made to the book.

The current version of the book is **2.5.11**.

## Extra Material

The book content and source are available at the [book's repository at GitHub](https://github.com/survivejs/react). Please note that the repository defaults to the `dev` branch of the project as this makes it convenient to contribute. To find source matching the version of the book you are reading, use the tag selector at GitHub's user interface as in the image below:

![GitHub tag selector](images/github.png)

The book repository contains code per chapter. This means you can start from anywhere you want without having to type it all through yourself. If you are unsure of something, you can always refer to that.

You can find a lot of complementary material at the [survivejs organization](https://github.com/survivejs/). Examples of this are alternative implementations of the application available written in [MobX](https://github.com/survivejs-demos/mobx-demo), [Redux](https://github.com/survivejs-demos/redux-demo), and [Cerebral/Baobab](https://github.com/survivejs-demos/cerebral-demo). Studying those can give you a good idea of how different architectures work out using the same example.

## Getting Support

As no book is perfect, you will likely come by issues and might have some questions related to the content. There are a couple of options to deal with this:

* Contact me through the [GitHub Issue Tracker](https://github.com/survivejs/react/issues)
* Join me at the [Gitter Chat](https://gitter.im/survivejs/react)
* Follow [@survivejs](https://twitter.com/survivejs) at Twitter for official news or poke me through [@bebraw](https://twitter.com/bebraw) directly
* Send me email to [info@survivejs.com](mailto:info@survivejs.com)
* Ask me anything about Webpack or React at [SurviveJS AmA](https://github.com/survivejs/ama/issues)

If you post questions to Stack Overflow, tag them using **survivejs** so I will get notified of them. You can use the hashtag **#survivejs** at Twitter for same effect.

I have tried to cover some common issues at the *Troubleshooting* appendix. That will be expanded as common problems are found.

## Announcements

I announce SurviveJS related news through a couple of channels:

* [Mailing list](http://eepurl.com/bth1v5)
* [Twitter](https://twitter.com/survivejs)
* [Blog RSS](http://survivejs.com/atom.xml)

Feel free to subscribe.

## Acknowledgments

An effort like this wouldn't be possible without community support. There are a lot of people to thank as a result!

Big thanks to [Christian Alfoni](http://www.christianalfoni.com/) for starting the [react-webpack-cookbook](https://github.com/christianalfoni/react-webpack-cookbook) with me. That work eventually led to this book and eventually became [a book of its own](http://survivejs.com/webpack/introduction).

The book wouldn't be half as good as it is without patient editing and feedback by my editor [Jesús Rodríguez Rodríguez](https://github.com/Foxandxss). Thank you.

Special thanks to Steve Piercy for numerous contributions. Thanks to [Prospect One](http://prospectone.pl/) and [Dixon & Moe](http://dixonandmoe.com/) for helping with the logo and graphical outlook. Thanks for proofreading to Ava Mallory and EditorNancy from fiverr.com.

Numerous individuals have provided support and feedback along the way. Thank you in no particular order Vitaliy Kotov, @af7, Dan Abramov, @dnmd, James Cavanaugh, Josh Perez, Nicholas C. Zakas, Ilya Volodin, Jan Nicklas, Daniel de la Cruz, Robert Smith, Andreas Eldh, Brandon Tilley, Braden Evans, Daniele Zannotti, Partick Forringer, Rafael Xavier de Souza, Dennis Bunskoek, Ross Mackay, Jimmy Jia, Michael Bodnarchuk, Ronald Borman, Guy Ellis, Mark Penner, Cory House, Sander Wapstra, Nick Ostrovsky, Oleg Chiruhin, Matt Brookes, Devin Pastoor, Yoni Weisbrod, Guyon Moree, Wilson Mock, Herryanto Siatono, Héctor Cascos, Erick Bazán, Fabio Bedini, Gunnari Auvinen, Aaron McLeod, John Nguyen, Hasitha Liyanage, Mark Holmes, Brandon Dail, Ahmed Kamal, Jordan Harband, Michel Weststrate, Ives van Hoorne, Luca DeCaprio, @dev4Fun, Fernando Montoya, Hu Ming, @mpr0xy, David "@davegomez" Gómez, Aleksey Guryanov, Elio D'antoni, Yosi Taguri, Ed McPadden, Wayne Maurer, Adam Beck, Omid Hezaveh, Connor Lay, Nathan Grey, Avishay Orpaz, Jax Cavalera, Juan Diego Hernández, Peter Poulsen, Harro van der Klauw, Tyler Anton, Michael Kelley, @xuyuanme, @RogerSep, Jonathan Davis, @snowyplover, Tobias Koppers, Diego Toro, George Hilios, Jim Alateras, @atleb, Andy Klimczak, James Anaipakos, Christian Hettlage, Sergey Lukin, Matthew Toledo, Talha Mansoor, Pawel Chojnacki, @eMerzh, Gary Robinson, Omar van Galen, Jan Van Bruggen, Savio van Hoi, Alex Shepard, Derek Smith, Tetsushi Omi, Maria Fisher, Rory Hunter, Dario Carella, Toni Laukka, Blake Dietz, Felipe Almeida, Greg Kedge, Deepak Kannan, Jake Peyser, Alfred Lau, Tom Byrer, Stefanos Grammenos, Lionel Ringenbach, Hamilton Greene, Daniel Robinson, @karloxyz, Nicolò Ribaudo, Andrew Wooldridge, Francois Constant, Wes Price, Dawid Karabin, @alavkx, Aitor Gómez-Goiri, P.E. Butler III, @TomV, John Korzhuk, @markfox1, Jaime Liz, Richard C. Davis, Alexander Myshov, @skarlinski, and many others. If I'm missing your name, I might have forgotten to add it.
