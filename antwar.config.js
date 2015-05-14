'use strict';

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
    webpack_react: function() {
      return require.context('./manuscript', true, /^\.\/.*\.md$/);
    }
  }
};

