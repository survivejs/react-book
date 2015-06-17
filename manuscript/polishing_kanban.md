# Polishing Kanban

Our Kanban application is almost usable now. It doesn't look that bad and there's some basic functionality in place. In this chapter I'll show you how to take it to the next level. We will integrate some drag and drop functionality as we set up [React DnD](https://gaearon.github.io/react-dnd/). After this chapter you should be able to sort notes within a lane, drag them from a lane to another and sort lanes.

## Setting Up React DnD

Before going further hit `npm i react-dnd --save-dev` to add React DnD to the project. Next we'll need to patch out application to use it.

**app/components/App.jsx**

```javascript
...
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

...

@DragDropContext(HTML5Backend)
@persist(storage, storageName, () => JSON.parse(alt.takeSnapshot()))
export default class App extends React.Component {
...
}
```

This will tell us application that it's going to have some DnD goodies in it. We'll use `HTML5Backend`. In the future there might be other backends to support specific targets (ie. touch and such).

In order to silence that `new-cap` error ESlint gives, set it off as follows. We won't be needing that.

**.eslintrc**

```json
"rules": {
  "new-cap": 0,
  ...
}
```

The application looks exactly the same as before. We are now ready to add some sweet functionality to it, though.

## Sorting Notes Within a Lane



## Conclusion

TODO
