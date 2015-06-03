'use strict';
var _ = require('lodash');
var removeMd = require('remove-markdown');
var marked = require('marked');
var highlightPlugin = require('antwar-highlight-plugin');
var prevnextPlugin = require('antwar-prevnext-plugin');

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
    name: 'antwar-default-theme',
    navigation: [
      {title: 'Home', url: '/'},
      {title: 'Table of Contents', url: '/webpack_react'},
    ],
  },
  paths: {
    '/': {
      path: function() {
        return require.context('./pages');
      },
    },
    webpack_react: {
      title: 'Table of Contents',
      path: function() {
        return require.context('./manuscript', true, /^\.\/.*\.md$/);
      },
      processItem: {
        title: function(o) {
          return removeMd(o.file.__content.split('\n')[0]);
        },
        content: function(o) {
          var content = o.file.__content.split('\n').slice(1).join('\n');

          return parseQuotes(content);
        },
        preview: function(o) {
          var previewLimit = 150;
          var content = o.file.__content.split('\n').slice(1).join('\n');
          var stripped = removeMd(content);

          if(stripped.length > previewLimit) {
            return stripped.substr(0, previewLimit) + '…';
          }

          return stripped;
        },
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

function parseQuotes(data) {
  var tokens = marked.lexer(data).map(function(t) {
    if(t.type === 'paragraph') {
      return parseCustomQuote(t, 'T>', 'tip') ||
        parseCustomQuote(t, 'W>', 'warning') ||
        t;
    }

    return t;
  });
  tokens.links = [];

  return marked.parser(tokens);
}

function parseCustomQuote(token, match, className) {
  if(token.type === 'paragraph') {
    var text = token.text;

    if(text.indexOf(match) === 0) {
      return {
        type: 'html',
        text: '<blockquote class="' + className + '">' + text.slice(2).trim() + '</blockquote>',
      };
    }
  }
}

function id(a) {return a;}
