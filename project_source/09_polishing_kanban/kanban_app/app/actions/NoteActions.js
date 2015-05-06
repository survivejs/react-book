export default (cursor) => {
  return {
    create: (task) => {
      // XXX: it's not enough this is unique per notes. it should be unique
      // per lanes for DnD to work sensibly
      const id = cursor.get().length || 0;

      cursor.push({id, task});
    },
    update: (i, task) => {
      cursor.select(i).update({
        task: {
          $set: task
        }
      });
    },
    remove: (i) => {
      cursor.unset(i);
    }
  };
};
