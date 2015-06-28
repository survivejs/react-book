var React = require('react');

var Index = React.createClass({
    displayName: 'Index',

    render: function() {
        return (
            <div className='frontpage'>
                <div className='post__heading'>
                    <h3 className='front-header'>SurviveJS - Webpack and React</h3>
                    <h1 className='front-motto'>Go from zero to Webpack and React hero</h1>
                    <img className='front-cover' src='images/title_page_small.jpg' />
                    <div className='front__buttons'>
                        <a href='webpack_react/introduction' className='btn btn--inverted'>Read the Book</a>
                        <a href='https://leanpub.com/survivejs_webpack' className='btn btn--buy'>Buy the Ebook</a>
                        <a href='https://github.com/survivejs/webpack_react' className='btn btn--inverted'>View on GitHub</a>
                    </div>
                </div>
                <div className='post post--front'>
                    <div className='post__content' dangerouslySetInnerHTML={{__html: require('./index.md').content}} />
                </div>
            </div>
        );
    }
});

module.exports = Index;

