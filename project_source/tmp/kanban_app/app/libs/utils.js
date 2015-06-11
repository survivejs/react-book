export function getInitialData(storageName, storeName) {
  return storage.get(storageName)[storeName];
}
