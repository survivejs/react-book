# Preface

A lot of web development is about dealing with various assets. You'll have things like JavaScript, stylesheets, templates, images, fonts, configuration, you name it. Your user doesn't really care. From that point of view it's the user experience that matters. An important part of that is performance. You don't want to leave your user waiting.

## What's In It for You?

Webpack can help you to reach this goal. Traditionally you might use a set of separate tools and glue them together. Makefile, Gruntfile or Gulpfile would then orchestrate this. Obviously this takes a lot of scripting. Time spent scripting is time not spent developing. This is where Webpack comes in.

At first it might seem kind of magical. After all you are dealing with a potentially large set of configuration. To unlock the power of Webpack, you'll need to understand it very well. After that it gets simple and you start wondering why didn't I know about this before.

## What Does Webpack Offer?

At its core Webpack understands how your application loads assets and how those assets depend on each other. All assets can individually, or by type, be processed by Webpack giving you the ability to attach transpilers, base64 converters etc. It comes with its own development server you can either run in parallel with your existing server or as a separate process. Better yet, it supports goodies such as *hot module reloading* but we will get into that later.

## Who Is This Book For?

If you develop web applications, this book can help you. We'll start from the very basics and then build on that. As a result you'll learn how to produce highly optimized applications using bleeding edge technology Webpack enables you to use.

In case you use Webpack already, we'll be able to deepen your understanding of the tool. There are lots of nooks and crannies to explore. You will learn to develop your own loaders and will be able to debug possible errors easier.

> Interestingly Webpack isn't just about frontend. There are some novel approaches that allow you to benefit from it in Node.js server environment.

## How This Book Is Organized

We will start by delving into the basics of Webpack and try to make sense of the system as a whole. We will get your first workflow running and then expand on that. After this you should be able to hook up Webpack with your favorite alternative JS languages and start developing on a basic level.

Next we will dig into assets, CSS, fonts and images in particular. We will discuss various strategies for dealing with these basic asset styles. You will learn how to get automatic CSS refresh during development for instance. We want to turbocharge you as a developer.

No application remains a prototype forever. You will want to deploy something at some point. The simplest way is just to generate a single bundle and hope for the best. In more complex cases you will want something more clever. We will show you how to achieve that. We will also touch on React JS a little bit to show one powerful approach.

Finally we will build on top of this knowledge and help you understand Webpack on a deeper level. You will learn techniques that can help you to improve your build and development workflow further.

The code presented in this book, as well as errata and discussion forums, can be found at: TBD
