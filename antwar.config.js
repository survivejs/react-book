'use strict';
var _ = require('lodash');
var removeMd = require('remove-markdown');
var markdown = require('commonmark');

var mdReader = new markdown.Parser();
var mdWriter = new markdown.HtmlRenderer();

module.exports = {
  output: 'build',
  name: 'SurviveJS - Survive the jungles of JavaScript',
  author: 'Juho Vepsäläinen',
  deploy: {
    branch: 'gh-pages',
  },
  theme: {
    name: 'antwar-default-theme',
    navigation: [
      {title: 'Home', path: '/'},
      {title: 'Read the Book', path: '/webpack_react'},
    ],
  },
  paths: {
    webpack_react: {
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
        var content = file.__content.split('\n').slice(1).join('\n');

        var stripped = removeMd(content);

        if(stripped.length > 100) {
          return stripped.substr(0, 100) + '…';
        }

        return stripped;
      },
      path: function() {
        return require.context('./manuscript', true, /^\.\/.*\.md$/);
      },
      sort: function(files) {
        // TODO: figure out a nice way to make this work in browser context!
        // now this works for static build but not in development mode
        var fs = require('fs');

        // browser context
        if(!fs.readFileSync) {
          return files;
        }

        var order = fs.readFileSync('./manuscript/Book.txt', {
          encoding: 'utf8'
        }).split('\n').filter(id);

        var ret = [];

        order.forEach(function(name) {
          var result = _.findWhere(files, {
            name: name,
          });

          if(result) {
            ret.unshift(result);
          }
        });

        return ret;
      },
    }
  }
};

function id(a) {return a;}
