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
            if sectionName and sectionName is not '/' then Nav()
            main { role: 'main' }, @props.children
