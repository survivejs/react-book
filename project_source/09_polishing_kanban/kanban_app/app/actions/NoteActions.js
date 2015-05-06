export default (lanesCursor, notesCursor) => {
  return {
    create: (task) => {
      // TODO: calculate id based on amount of notes based on lanesCursor
      const id = notesCursor.get().length || 0;

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
