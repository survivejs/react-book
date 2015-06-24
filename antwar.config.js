'use strict';
var _ = require('lodash');
var removeMd = require('remove-markdown');
var marked = require('marked');
var renderer = new marked.Renderer();
var highlightPlugin = require('antwar-highlight-plugin');
var prevnextPlugin = require('antwar-prevnext-plugin');

// alter marked renderer to add slashes to beginning so images point at root
// leanpub expects images without slash...
renderer.image = function(href, title, text) {
  return '<img src="/' + href + '" alt="' + text + '">';
};

// patch ids (this.options.headerPrefix can be undefined!)
renderer.heading = function(text, level, raw) {
  var id = raw.toLowerCase().replace(/[^\w]+/g, '-');

  return '<h'
    + level
    + ' id="'
    + id
    + '">'
    + text
    + '<a class="header-anchor" href="#' + id + '">#</a>'
    + '</h'
    + level
    + '>\n';
};

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
  name: 'SurviveJS - Webpack and React',
  author: 'Juho Vepsäläinen',
  deploy: {
    branch: 'gh-pages',
  },
  plugins: [
    highlightPlugin({
      style: function() {
        require('highlight.js/styles/github.css');
      },
      languages: ['bash', 'css', 'javascript', 'json', 'html'],
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
      {title: 'Buy the ebook', url: 'https://leanpub.com/survivejs_webpack'},
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
        layout: function() {
          return require('./layouts/Chapter.coffee');
        },
        title: function(o) {
          return removeMd(o.file.__content.split('\n')[0]);
        },
        content: function(o) {
          var content = o.file.__content.split('\n').slice(1).join('\n');
          var tokens = parseQuotes(content);

          return marked.parser(tokens, {
            renderer: renderer,
          });
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
        url: function(o) {
          var fileName = o.fileName.split('.')[0].toLowerCase();

          return o.sectionName + '/' + fileName.split('_').slice(1).join('_');
        },
      },
      sort: function(files) {
        var headers = require('./manuscript/headers.json');
        var order = require('raw!./manuscript/Book.txt').split('\n').filter(id);
        var ret = [];

        order.forEach(function(name, i) {
          var result = _.findWhere(files, {
            name: name,
          });
          var header = headers[i];

          result.file.headerExtra = '<a href="' + header.source + '">' +
            header.author + ' ('+ header.license + ')</a>';
          result.file.headerImage = '/images/' + header.image;
          result.file.previousInfo = 'Previous chapter';
          result.file.nextInfo = 'Next chapter';

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

  return tokens;
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
