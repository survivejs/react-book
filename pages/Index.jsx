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
                backgroundImage: 'url(/assets/img/front.jpg)',
                backgroundSize: 'cover',
            }
        };

        return (
            <div className='post post--front'>
                <div className='header-image header-image--front' style={styles.headerImage}></div>
                <div className='post__heading'>
                    <h1 className='front-header' style={styles.frontHeader}>SurviveJS</h1>
                    <h3>Survive the jungles of JavaScript</h3>
                    <div className='front__buttons'>
                        <a href='https://github.com/survivejs/webpack_react' className='btn btn--inverted'>View on GitHub</a>
                    </div>
                </div>
                <div className='post__content'>
                    <h3>What?</h3>
                    <p>Something</p>
                    <h3>Why?</h3>
                    <p>Something</p>
                </div>
            </div>
        );
    }

});

module.exports = Index;

