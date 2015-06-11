export const storageName = 'kanban_storage';

export const storage = {
  get: function(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    }
    catch(e) {
      return null;
    }
  },
  set: function(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  }
};

export function getInitialData(storeName) {
  var o = storage.get(storageName);

  return o && o[storeName];
}
