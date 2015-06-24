React = require 'react'
NavigationLink = React.createFactory require 'antwar-core/NavigationLink'
Paths = require 'antwar-core/PathsMixin'
Router = require 'react-router'
config = require 'config'
_ = require 'lodash'

{ div, span, header, h1, h4, a } = require 'react-coffee-elements'

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
