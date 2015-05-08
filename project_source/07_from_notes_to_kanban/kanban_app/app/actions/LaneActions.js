export default (cursor) => {
  return {
    create: (name) => {
      cursor.push({
        id: cursor.get().length,
        name: name,
        notes: []
      });
    }
  };
};
