'use strict';

export default (cursor) => {
  return {
    createLane: (name) => {
      cursor.select('lanes').push({
        name: name,
        todos: []
      });
    }
  };
};
