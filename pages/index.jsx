var React = require('react');

var Index = React.createClass({
    displayName: 'Index',

    render: function() {
        return (
            <div className='frontpage'>
                <div className='front__heading' style={{
                    backgroundSize: 'cover',
                    backgroundImage: 'url(/images/front.jpg)',
                    backgroundPosition: 'top center',
                    width: '100%',
                    flexDirection: 'row',
                    paddingBottom: '2vh',
                }}>
                    <div className='front-text-wrapper'>
                        <h3 className='front-header'>SurviveJS - Webpack and React</h3>
                        <h1 className='front-motto'>Go from zero to Webpack and React hero</h1>

                        <div className='front__buttons'>
                            <a className='btn btn--inverted' href='/webpack_react/introduction'>Read the book</a>
                            <a className='btn btn--inverted' href='https://leanpub.com/survivejs_webpack_react'>Buy the ebook</a>
                        </div>
                    </div>
                </div>
                <div className='post post--front'>
                    <section className='post__content' dangerouslySetInnerHTML={{__html: require('./index.md').content}} />
                    <aside className='post__sidebar' dangerouslySetInnerHTML={{__html: require('./sidebar.md').content}} />
                </div>
            </div>
        );
    }
});

module.exports = Index;

