var React = require('react');
var Paths = require('antwar-core/PathsMixin');
var _ = require('lodash');

var Index = React.createClass({
    displayName: 'Index',

    mixins: [Paths],

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

                        <div className='front__latestpost'>
                            {this.renderBlogTeaser()}
                        </div>
                    </div>
                </div>
                <div className='post post--front'>
                    <section className='post__content' dangerouslySetInnerHTML={{__html: require('./index.md').content}} />
                    <aside className='post__sidebar' dangerouslySetInnerHTML={{__html: require('./sidebar.md').content}} />
                </div>
            </div>
        );
    },
    renderBlogTeaser: function() {
        var post = _.reject(this.getSectionItems('blog'), function(post) {
            return post.isDraft;
        })[0];

        return (
            <a className='front__latestpost-link' href={post.url}>
                {'From the blog: ' + post.title}
            </a>
        );
    }
});

module.exports = Index;

