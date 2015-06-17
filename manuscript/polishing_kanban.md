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

## Preparing Notes to Be Sorted

Next we will need to tell React DnD what can be dragged and where. Since we want to move notes, we'll want to annotate them accordingly. In addition we'll need some logic to tell what happens during this process.

Earlier we extracted some of the editing functionality from `Note` and ended up dropping it. Since we need to decorate the component and don't want to end up with a mess, it seems like we'll want to add that concept back if only for decoration purposes.

**app/components/Notes.jsx**

```javascript
...

import Note from './Note';

...

<ul className='notes'>{notes.map((note, i) =>
  <Note className='note' key={'note' + i}>
    <Editable
      value={note.task}
      onEdit={this.props.onEdit.bind(this, i)} />
  </Note>
)}</ul>
```

**app/components/Note.jsx**

```javascript
import React from 'react';

export default class Note extends React.Component {
  render() {
    return (
      <li {...this.props}>{this.props.children}</li>
    );
  }
}
```

Now we have a little `Note` wrapper which we can decorate. The design could have been different. `Note` could contain `Editable` itself but then we would have to maintain a constructor since we need to pass the data there. Now `Note` is more about encapsulating DnD logic and showing whatever we pass to it. Next we need to connect that logic to it.

## Sorting Notes Within a Lane

TODO

## Conclusion

TODO
