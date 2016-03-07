# Amazon Errata

This document contains a list of important fixes made since the initial [Amazon release](http://www.amazon.com/SurviveJS-Webpack-React-apprentice-master/dp/152391050X/) (2.0.0). Note that the Amazon version has been patched with these changes so it's quite likely your paper book already has at least some of them, if not all.

## Webpack Compared

* Page 8 - Added missing "that" to a sentence. "Given declarations" -> "Given that declarations" (2.0.4)

## Implementing a Basic Note Application

* Page 65 - Avoid event bubbling with `deleteNote` to make behavior more predictable across browsers (2.0.5). Example:

```javascript
deleteNote = (id, e) => {
  // Avoid bubbling to edit
  e.stopPropagation();

  this.setState({
    notes: this.state.notes.filter(note => note.id !== id)
  });
};
```

## From Notes to Kanban

* Page 103 - `app/stores/NoteStore.jsx` -> `app/stores/NoteStore.js` (2.0.6)
* Page 108 - Fixed code example. Swapped `export default class Editable extends React.Component {` with `export default class Note extends React.Component {`. (2.0.3)

## Implementing Drag and Drop

* Pages 139 and 140 - Use `.jsx` extension instead of `.js` for the examples. (2.0.4)

## Building Kanban

* Page 152 - Added missing `npm i clean-webpack-plugin --save-dev`. The plugin needs to be installed in order to work. (2.0.2)
* Page 154 - Add missing `inject: false` to `HtmlWebpackPlugin` declaration. (2.0.4)

## Linting in Webpack

* Page 203 - Updates ESLint configuration to ESLint 2 style. The old configuration will still work. The new one requires one less dependency. (2.0.3)
