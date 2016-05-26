import NoteStore from '../../stores/NoteStore';

export default alt => {
  alt.addStore('notes', NoteStore);
}