const CancelTokenMap = new Map();
export function setCancelToken(key, value) {
  if (!CancelTokenMap.has(key)) {
    CancelTokenMap.set(key, value);
  }
}
export function getCancelToken(key) {
  return CancelTokenMap.get(key)
}
export function getCancelTokens() {
  return CancelTokenMap;
}
export function clearCancelToken(key) {
  if (CancelTokenMap.has(key)) {
    console.warn("clearCancelToken => ", CancelTokenMap.get(key));
    CancelTokenMap.get(key).cancel("提示：不能重复请求");
  }
}
