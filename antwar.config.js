'use strict';
var removeMd = require('remove-markdown');

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
        var title =  file.__content.split('\n')[0];
        var parts = title.split('#');

        // maybe there's a nicer way to trim markdown?
        return parts.length > 1 ? parts[1].trim(): '';
      },
      date: function(file) {
        // dates aren't needed
        return;
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
      }
    }
  }
};

