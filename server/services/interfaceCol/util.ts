// @ts-nocheck
/**
 * 测试集合纯工具函数
 */

/** 请求参数数组转空值对象（变量提取用） */
export function requestParamsToObj(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return {};
  }
  const obj = {};
  arr.forEach((item) => {
    obj[item.name] = "";
  });
  return obj;
}

/** 数组按字段去重并返回字段值列表 */
export function uniqueFieldValues(array, field) {
  const hash = {};
  const arr = array.reduce(function (item, next) {
    hash[next[field]] ? "" : (hash[next[field]] = true && item.push(next));
    return item;
  }, []);
  return arr.map((item) => item[field]);
}
