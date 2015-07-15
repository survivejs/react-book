React = require 'react'
NavigationLink = React.createFactory require 'antwar-core/NavigationLink'
Paths = require 'antwar-core/PathsMixin'
Router = require 'react-router'
config = require 'config'
_ = require 'lodash'

{ div, span, header, h1, h4, a, nav, script } = require 'react-coffee-elements'

module.exports = React.createClass

  displayName: 'Chapter'

  mixins: [ Router.State, Paths ]

  render: ->
    item = @getItem()
    author = item.author or config.author.name
    sectionItems = @getSectionItems()
    div className: 'post',
      div className: "docs-nav__wrapper#{if item.headerImage? then ' docs-nav__wrapper--push-down' else ''}",
        h4 className: 'docs-nav--header', 'Table of Contents'
        div className: 'docs-nav',
          _.map sectionItems, (navItem, i) ->
            if navItem.title is item.title
              span key: 'navItem' + i, className: "docs-nav__link docs-nav__link--current", navItem.title
            else
              a key: 'navItem' + i, href: "/#{navItem.url}", className: "docs-nav__link", navItem.title

      if item.headerImage? then div className: 'header-image', style: backgroundImage: "url(#{item.headerImage})"
      h1 className: 'post__heading',
        item.title

      div className: 'post__content',
        div className: 'post__meta',
          if item.startSource then div className: 'post__start_source', a href: item.startSource, target: '_blank', 'Start source code'
          if item.endSource then div className: 'post__end_source', a href: item.endSource, target: '_blank', 'Finished source code'
          if item.demo then div className: 'post__demo', a href: item.demo, target: '_blank', 'Demo'

        div dangerouslySetInnerHTML: __html: item.content
        div className: 'social-links', dangerouslySetInnerHTML: __html: '<blockquote>If you enjoyed this chapter, consider subscribing to <a href="http://eepurl.com/bth1v5">the mailing list</a> or following <a href="https://twitter.com/survivejs">@survivejs</a> for occasional updates. There is also <a href="/atom.xml">RSS</a> available for old beards (no pun intended).</blockquote>'

        div id: 'disqus_thread'

        if item.next or item.prev
          div className: 'prevnext',
            if item.prev
                div {className: 'prevnext__prev'},
                  div {className: 'prevnext__bg', style: backgroundImage: "url(#{item.prev.headerImage})"}
                  span className: 'prevnext__info', "Previous chapter"
                  a className: 'prevnext__link', href: "/#{item.prev.url}", item.prev.title
            if item.next
                div {className: 'prevnext__next'},
                  div {className: 'prevnext__bg', style: backgroundImage: "url(#{item.next.headerImage})"}
                  span className: 'prevnext__info', "Next chapter"
                  a className: 'prevnext__link', href: "/#{item.next.url}", item.next.title

        if item.next
          a className: 'next-page', href: '/' + item.next.url, item.next.title

        if item.prev
          a className: 'previous-page', href: '/' + item.prev.url, item.prev.title

      if item.headerExtra? then div className: 'header-extra', dangerouslySetInnerHTML: __html: item.headerExtra

      script {type: 'text/javascript', dangerouslySetInnerHTML: __html: "var disqus_shortname = 'survivejs';(function() {var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);})();"}
