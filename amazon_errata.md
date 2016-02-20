# Amazon Errata

This document contains a list of important fixes made since the initial [Amazon release](http://www.amazon.com/SurviveJS-Webpack-React-apprentice-master/dp/152391050X/) (2.0.0):

## From Notes to Kanban

* Page 108 - Fixed code example. Swapped `export default class Editable extends React.Component {` with `export default class Note extends React.Component {`. (2.0.3)

## Building Kanban

* Page 152 - Added missing `npm i clean-webpack-plugin --save-dev`. The plugin needs to be installed in order to work. (2.0.2)

## Linting in Webpack

* Page 203 - Updates ESLint configuration to ESLint 2 style. The old configuration will still work. The new one requires one less dependency. (2.0.3)
