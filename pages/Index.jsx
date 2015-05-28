var React = require('react');

var Index = React.createClass({
    displayName: 'Index',

    render: function() {
        var styles = {
            frontHeader: {
                fontSize: '54px',
                lineHeight: '1.5',
            },
            headerImage: {
                background: '#bde2bd',
                backgroundImage: 'url(assets/img/front.jpg)',
                backgroundSize: 'cover',
            }
        };

        return (
            <div className='post post--front'>
                <div className='header-image header-image--front' style={styles.headerImage}></div>
                <div className='post__heading'>
                    <h1 className='front-header' style={styles.frontHeader}>SurviveJS - Webpack and React</h1>
                    <h3>Go from zero to Webpack and React hero</h3>
                    <div className='front__buttons'>
                        <a href='webpack_react' className='btn btn--inverted'>Read the Book</a>
                        <a href='https://github.com/survivejs/webpack_react' className='btn btn--inverted'>View on GitHub</a>
                        <a href='https://leanpub.com/survivejs_webpack' className='btn btn--inverted'>Buy the Ebook</a>
                    </div>
                </div>
                <div className='post__content'>
                    <h3>What?</h3>

                    <p>Getting started with JavaScript can be painful. Technology keeps on improving all the time and it can be difficult to keep up. That is where SurviveJS comes in.</p>
                    <p>The first book of the series focuses on Webpack and React. Webpack, a module bundler, solves the fundamental problem of frontend development. In the end you will want to package a bunch of various assets into something for client to consume. Webpack can do that with ease.</p>
                    <p>Facebook's React is another one of those tools that simplifies the life of web developers greatly. Although it is just a library focusing on rendering views it has changed the way we think about frontend development.</p>
                    <p>Combined these two technologies provide an excellent starting point for modern web application development.</p>

                    <h3>Why?</h3>

                    <p>SurviveJS - Webpack and React is the book I wish I had when I bumped into these technologies the first time. It would have saved a lot of time and headaches. But worry not. You don't have to be as unlucky.</p>
                    <p>I have distilled my knowledge about the topic in this book in an easy to follow format. Following the book you will build a simple Kanban application that can be used for tracking tasks. When ready you can even you use it with your own projects.</p>
                    <p>As I am aware just following along can be boring I have set up the project in its various steps in the accompanying GitHub repository. The book isn't entirely tutorial-driven. Some parts provide you more general view of the web development scene. For instance I discuss topics such as styling and library authorship in greater detail.</p>

                    <h3>When?</h3>

                    <p>An early version of the book is already available. I keep track of the status of the book in <a href="https://github.com/survivejs/webpack_react#progress">the project README</a>. Especially early chapters and a couple of the later ones are in a good condition. Feedback is very welcome.</p>

                    <h3>How to support?</h3>

                    <p>Even though the book is free under CC BY-NC-ND license, financial support is welcome. You can for instance purchase <a href="https://leanpub.com/survivejs_webpack">an electronic copy of the book</a>.</p>
                </div>
            </div>
        );
    }
});

module.exports = Index;

