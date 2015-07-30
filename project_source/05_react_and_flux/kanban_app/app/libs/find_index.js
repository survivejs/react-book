export default function findIndex(arr, prop, value) {
  const o = arr.filter(c => c[prop] === value)[0];

  return o && arr.indexOf(o);
}