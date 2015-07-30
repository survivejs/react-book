export default function findIndex(arr, prop, value) {
  const o = arr.filter(c => c[prop] === value)[0];
  const ret = o && arr.indexOf(o);

  return ret >= 0 ? ret : -1;
}