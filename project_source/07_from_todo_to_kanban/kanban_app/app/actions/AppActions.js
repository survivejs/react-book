'use strict';

export default (tree) => {
  return {
    createLane: (name) => {
      var lanes = tree.select('lanes');

      console.log('creating lane', name, 'lanes before', lanes.get());

      lanes.push({
        id: lanes.get().length,
        name: name,
        notes: []
      });
    }
  };
};
