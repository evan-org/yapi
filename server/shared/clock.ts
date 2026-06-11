/**
 * 可注入时钟：repository 层统一取时间，避免依赖 yapi.commons
 */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
