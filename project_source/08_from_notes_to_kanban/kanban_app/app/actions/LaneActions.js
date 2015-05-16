export default (cursor) => {
  return {
    create: (name) => {
      cursor.push({
        // XXX: not good enough, guarantee a free id
        // the problem is that items can get removed after adding ->
        // length can conflict
        id: cursor.get().length,
        name: name,
        notes: []
      });
    },
    remove: (id) => {
      var items = cursor.get();
      console.log('removing', id, items);

      // 1. find by id
      // 2. splice

      //cursor.splice([id, 1]);
      //cursor.tree.commit(); // XXX: needed?
    }
  };
};
