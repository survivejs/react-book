export default (cursor) => {
  return {
    create: (task) => {
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
