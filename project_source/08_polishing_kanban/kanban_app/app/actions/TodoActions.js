'use strict';

export default (cursor) => {
  return {
    createTodo: (task) => {
      const id = cursor.get().length;

      cursor.push({id, task});
    },
    updateTodo: (i, task) => {
      cursor.select(i).update({
        task: {
          $set: task
        }
      });
    },
    removeTodo: (i) => {
      cursor.unset(i);
    }
  };
};
