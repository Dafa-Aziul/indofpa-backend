export const groupBy = (arr, key) => {
  const map = {};
  for (const item of arr) {
    const val = item[key];
    if (!map[val]) map[val] = [];
    map[val].push(item);
  }
  return map;
};
