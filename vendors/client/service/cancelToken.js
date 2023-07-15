const CancelTokenMap = new Map();
export function setCancelToken(key, value) {
  CancelTokenMap.set(key, value);
}
export function getCancelToken(key) {
  return CancelTokenMap.get(key)
}
export function getCancelTokens(key) {
  return CancelTokenMap;
}
export function clearCancelToken(key) {
  if (CancelTokenMap.has(key)) {
    console.warn("clearCancelToken => ", CancelTokenMap.get(key));
    CancelTokenMap.get(key).cancel("提示：不能重复请求");
  }
}
