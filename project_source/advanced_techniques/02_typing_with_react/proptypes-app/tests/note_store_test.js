import assert from 'assert';
import NoteActions from '../app/actions/NoteActions';
import NoteStore from '../app/stores/NoteStore';
import alt from '../app/libs/alt';

alt.addStore('NoteStore', NoteStore);

describe('NoteStore', function() {
  beforeEach(function()  {
    alt.flush();
  });

  it('creates notes', function() {
    const task = 'test';

    NoteActions.create({task});

    const state = alt.stores.NoteStore.getState();

    assert.equal(state.notes.length, 1);
    assert.equal(state.notes[0].task, task);
  });

  it('updates notes', function() {
    const NoteStore = alt.stores.NoteStore;
    const task = 'test';
    const updatedTask = 'test 2';

    NoteActions.create({id: 123, task});

    const note = NoteStore.getState().notes[0];

    NoteActions.update({...note, task: updatedTask});

    const state = NoteStore.getState();

    assert.equal(state.notes.length, 1);
    assert.equal(state.notes[0].task, updatedTask);
  });

  it('deletes notes', function() {
    const NoteStore = alt.stores.NoteStore;

    NoteActions.create({id: 123, task: 'test'});

    const note = NoteStore.getState().notes[0];

    NoteActions.delete(note.id);

    const state = NoteStore.getState();

    assert.equal(state.notes.length, 0);
  });
});