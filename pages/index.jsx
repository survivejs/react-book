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
                background: '#558E8E',
                backgroundImage: 'url(/images/front.jpg)',
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
                <div className='post__content' dangerouslySetInnerHTML={{__html: require('./index.md').content}} />
            </div>
        );
    }
});

module.exports = Index;

