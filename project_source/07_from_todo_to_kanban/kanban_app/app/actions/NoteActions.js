'use strict';

export default (cursor) => {
  return {
    create: (task) => {
      cursor.push({task});
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
