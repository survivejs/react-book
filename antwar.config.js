'use strict';
var _ = require('lodash');
var removeMd = require('remove-markdown');
var markdown = require('commonmark');
var highlightPlugin = require('antwar-highlight-plugin');
var prevnextPlugin = require('antwar-prevnext-plugin');

var mdReader = new markdown.Parser();
var mdWriter = new markdown.HtmlRenderer();

module.exports = {
  assets: [
    {
      from: 'manuscript/images',
      to: 'images',
    },
    {
      from: './CNAME',
      to: './',
    }
  ],
  output: 'build',
  name: 'SurviveJS - Survive the jungles of JavaScript',
  author: 'Juho Vepsäläinen',
  deploy: {
    branch: 'gh-pages',
  },
  plugins: [
    highlightPlugin({
      style: function() {
        require('highlight.js/styles/github.css');
      },
      languages: ['bash', 'javascript', 'json', 'html'],
    }),
    prevnextPlugin({
      bodyContent: prevnextPlugin.bodyContent({
        previous: function(o) {
          return o.title;
        },
        previousUrl: function(o) {
          return '../' + o.split('/').slice(1).join('/');
        },
        next: function(o) {
          return o.title;
        },
        nextUrl: function(o) {
          return '../' + o.split('/').slice(1).join('/');
        },
      })
    }),
  ],
  theme: {
    customStyles: 'custom.scss',
    // TODO: push sectionTitle per path?
    sectionTitle: 'Table of Contents',
    name: 'antwar-default-theme',
    navigation: [
      {title: 'Home', url: '/'},
      // XXX: hot fix for ToC
      {title: 'Table of Contents', url: '/webpack_react'},
    ],
  },
  paths: {
    webpack_react: {
      path: function() {
        return require.context('./manuscript', true, /^\.\/.*\.md$/);
      },
      title: function(file) {
        return removeMd(file.__content.split('\n')[0]);
      },
      date: function(file) {
        // dates aren't needed
        return;
      },
      content: function(file) {
        var content = file.__content.split('\n').slice(1).join('\n');

        return mdWriter.render(mdReader.parse(content));
      },
      preview: function(file) {
        var previewLimit = 150;
        var content = file.__content.split('\n').slice(1).join('\n');
        var stripped = removeMd(content);

        if(stripped.length > previewLimit) {
          return stripped.substr(0, previewLimit) + '…';
        }

        return stripped;
      },
      sort: function(files) {
        var order = require('raw!./manuscript/Book.txt').split('\n').filter(id);
        var ret = [];

        order.forEach(function(name) {
          var result = _.findWhere(files, {
            name: name,
          });

          if(result) {
            ret.push(result);
          }
        });

        return ret;
      },
    }
  }
};

function id(a) {return a;}
