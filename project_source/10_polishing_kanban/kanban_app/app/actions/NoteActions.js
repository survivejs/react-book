export default (lanesCursor, notesCursor) => {
  return {
    create: (task) => {
      const id = getAmountOfNotes(lanesCursor);

      notesCursor.push({id, task});
    },
    update: (i, task) => {
      notesCursor.select(i).update({
        task: {
          $set: task
        }
      });
    },
    remove: (i) => {
      notesCursor.unset(i);
    }
  };
};

function getAmountOfNotes(lanesCursor) {
  return lanesCursor.get().map((lane) => lane.notes.length).reduce((a, b) => a + b) || 0;
}
