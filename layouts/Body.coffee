React = require 'react'
Nav = React.createFactory require 'antwar-default-theme/Nav'
Paths = require('antwar-core/PathsMixin')
require 'antwar-default-theme/scss/main.scss'

{ div, main, script, link } = require 'react-coffee-elements'

config = require 'config'
if config.theme.customStyles?
  require 'customStyles/' + config.theme.customStyles

module.exports = React.createClass

    displayName: 'Body'

    mixins: [
        Paths
    ]

    render: ->
        sectionName = @getSectionName()

        div { },
            if sectionName then Nav()
            main { role: 'main' }, @props.children
            if config.theme.analyticsId?
                script dangerouslySetInnerHTML: __html: "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create', '#{config.theme.analyticsId}', 'auto');ga('send', 'pageview');"
