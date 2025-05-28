export function extractKeys(listData, key) {
  return listData.map(element => element[key]);
}

export function groupBy(list, key) {
  return list.reduce(function(grouped, element) {
    (grouped[element[key]] = grouped[element[key]] || []).push(element);
    return grouped;
  }, {});
}
