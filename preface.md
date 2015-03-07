# Preface

A lot of web development is about dealing with various assets. You'll have things like javascript, stylesheets, templates, images, fonts, configuration, you name it. In the end you want a optimized package that is your application. This package should be downloaded to the browser as fast as possible to give the best user experience. The situation will just get more complex. New technologies will appear and you will need to adapt.

Webpack is one of those tools that can make your life considerably easier. Traditionally you might use a set of external tools and glue them together. You might set up something like a Gruntfile or Gulpfile and do a bit of scripting to get a build done. Webpack can be used with these tools. It solves one fundamental problem very well, the problem of bundling.

## What's In It for You?

In this book we will show you how to get most out of Webpack. It can be an intimidating tool to adopt. There is plenty of documentation and the tool will most likely look a bit foreign to you. You'll have things like `webpack.config.js` that is filled with cryptic lines. In addition you will have a bunch of `require`'s and such in your files.

## What Does Webpack Offer?

In the olden days we just concatenated our scripts. Now you need to deal with a variety of assets while making sure everything works as fast as possible. You don't want to have your client to load megabytes of JavaScript over the wire. You'll want to split up your bundles and optimize the JavaScript. Webpack can do that.

You might want to use upcoming features of JavaScript today. This is something that is simple with Webpack. It gives you access to a wide range of AltJS languages that output JavaScript.

Usage of CSS preprocessors is simple as well. You may use something like cssnext to use tomorrow's CSS features. Forget about vendor prefixes. The tooling can deal with that for you.

As we are in the business of bundling here, the concept goes beyond JavaScript and CSS. If you have something to bundle, we can do that.

## Who This Book Is For

If you are developing for the frontend, you are in the right company. It is expected you have a basic understanding of JavaScript. We won't discuss the intricacies of the language though we will show you some things that lie in the future. After reading this book you will know how to hook into the new, exciting tools that the world offers.

Even if you happen to use Webpack already, we might have something to offer for you. Besides absolute basics we will discuss more advanced production concepts and teach you to develop Webpack further. After all any tool is as strong as its community.

## How This Book Is Organized

We will start by delving into the basics of Webpack and try to make sense of the system as a whole. We will get your first build running and then expand on that. In the process we will make a little detour to a frontend library known as React.js and show how to get most out of it. It is a good demonstration of Webpack's hot reloading capabilities. After this you should be able to hook up Webpack with your favorite AltJS languages and start developing on a basic level.

Next we will dig into assets, CSS, fonts and images in particular. We will discuss various strategies for dealing with these basic asset styles. You will learn how to get automatic CSS refresh during development for instance. We want to turbocharge you as a develop after all.

Of course no application remains a prototype forever. You will want to deploy something at some point. The simplest way is just to generate a single bundle and hope for the best. In more complex cases you will want something more clever. We will show you how to achieve that. We will also touch on React again a little bit to show one powerful approach.

Finally we will build on top of this knowledge and help you understand Webpack on a deeper level. You will learn a bunch of techniques that can help you to improve your build and development workflow further.

The code presented in this book, as well as errata and discussion forums, can be found on its PragProg page: TBD.
