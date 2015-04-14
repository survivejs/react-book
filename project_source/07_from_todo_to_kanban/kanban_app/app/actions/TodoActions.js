'use strict';

export default (cursor) => {
  return {
    createTodo: (task) => {
      cursor.push({task});
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
