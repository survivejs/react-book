React = require 'react'
MomentDisplay = React.createFactory require 'antwar-default-theme/MomentDisplay'
Paths = require 'antwar-core/PathsMixin'
Router = require 'react-router'
config = require 'config'

{ div, span, header, h1, a, script } = require 'react-coffee-elements'

module.exports = React.createClass

  displayName: 'Item'

  mixins: [ Router.State, Paths ]

  render: ->
    item = @getItem()
    author = item.author or config.author.name

    div {},
      div className: 'post',
        if item.headerImage? then div className: 'header-image', style: backgroundImage: "url(#{item.headerImage})"
        h1 className: 'post__heading',
          item.title
        div className: 'post__content',
          if item.isDraft then span className: 'draft-text', ' Draft'
          div dangerouslySetInnerHTML: __html: item.content
          div className: 'social-links', dangerouslySetInnerHTML: __html: '<blockquote>If you enjoyed this post, consider subscribing to <a href="http://eepurl.com/bth1v5">the mailing list</a> or following <a href="https://twitter.com/survivejs">@survivejs</a> for occasional updates. There is also <a href="http://localhost:8000/atom.xml">RSS</a> available for old beards (no pun intended).</blockquote>'
        if item.headerExtra? then div className: 'header-extra', dangerouslySetInnerHTML: __html: item.headerExtra
        if item.date then MomentDisplay className: 'post__moment', datetime: item.date
        if author then div className: 'post__author', "Authored by #{author}"

        div id: 'disqus_thread'

        if item.next or item.prev
          div className: 'prevnext',
            if item.prev
                div {className: 'prevnext__prev'},
                  div {className: 'prevnext__bg', style: backgroundImage: "url(#{item.prev.headerImage})"}
                  span className: 'prevnext__info', item.previousInfo || 'You might also like'
                  a className: 'prevnext__link', href: "/#{item.prev.url}", item.prev.title
            if item.next
                div {className: 'prevnext__next'},
                  div {className: 'prevnext__bg', style: backgroundImage: "url(#{item.next.headerImage})"}
                  span className: 'prevnext__info', item.nextInfo || 'Next item'
                  a className: 'prevnext__link', href: "/#{item.next.url}", item.next.title
      script {type: 'text/javascript', dangerouslySetInnerHTML: __html: "var disqus_shortname = 'survivejs';(function() {var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);})();"}
