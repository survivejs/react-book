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
                </div>
                <div className='post post--front'>
                    <div className='post__content' dangerouslySetInnerHTML={{__html: require('./index.md').content}} />
                </div>
            </div>
        );
    }
});

module.exports = Index;

