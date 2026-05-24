/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/**/*.{js,jsx}",
    "./exts/**/*.{js,jsx}"
  ],
  corePlugins: {
    // 保留既有 reset / 布局，避免与 Ant Design 冲突
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        yapi: {
          primary: "#2395f1",
          dark: "#32363a",
          gray: "#eceef1"
        }
      },
      maxWidth: {
        yapi: "12.2rem"
      }
    }
  }
};
