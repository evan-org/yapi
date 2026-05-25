/**
 * AVA 6 原生 ESM：跑 tsc 编译后的 dist 测试（兼容 Node 18 CI，避免旧版 ava require ESM 失败）
 */
export default {
  files: ["dist/test/**/*.test.js"],
};
