'use strict';

export default (cursor) => {
  return {
    createLane: (name) => {
      var lanes = cursor.select('lanes');

      lanes.push({
        id: lanes.get().length,
        name: name,
        notes: []
      });
    }
  };
};
