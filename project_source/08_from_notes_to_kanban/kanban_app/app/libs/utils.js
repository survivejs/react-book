export function getStorageName() {
    return 'kanban_storage';
}

export function getInitialData(storage, storageName, storeName) {
  var o = storage.get(storageName);

  return o && o[storeName];
}
