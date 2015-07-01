var React = require('react');

var Index = React.createClass({
    displayName: 'Index',

    render: function() {
        return (
            <div className='frontpage'>
                <div className='front__heading' style={{
                    backgroundSize: 'cover',
                    backgroundImage: 'url(/images/front.jpg)',
                    backgroundPosition: '0px 42%',
                    width: '100%',
                    flexDirection: 'row',
                }}>
                    <div className='front-text-wrapper'>
                        <h1 className='front-header'>SurviveJS - Webpack and React</h1>
                        <h3 className='front-motto'>From apprentice to master</h3>

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

