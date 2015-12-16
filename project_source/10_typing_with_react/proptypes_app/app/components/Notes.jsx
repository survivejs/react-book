import React from 'react';
import Editable from './Editable.jsx';
import Note from './Note.jsx';
import LaneActions from '../actions/LaneActions';

class Notes extends React.Component {
  render() {
    const notes = this.props.items;

    return <ul className="notes">{notes.map(this.renderNote, this)}</ul>;
  }
  renderNote(note) {
    return (
      <Note className="note" onMove={LaneActions.move}
        id={note.id} key={note.id}>
        <Editable
          editing={note.editing}
          value={note.task}
          onValueClick={this.props.onValueClick.bind(null, note.id)}
          onEdit={this.props.onEdit.bind(null, note.id)}
          onDelete={this.props.onDelete.bind(null, note.id)} />
      </Note>
    );
  }
}
Notes.propTypes = {
  items: React.PropTypes.array,
  onEdit: React.PropTypes.func,
  onDelete: React.PropTypes.func,
  onValueClick: React.PropTypes.func
};
Notes.defaultProps = {
  items: [],
  onEdit: () => {},
  onDelete: () => {}
};

export default Notes;
