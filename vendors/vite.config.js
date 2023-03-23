import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// 静态资源压缩
import compressPlugin from "vite-plugin-compression";
// resolve
function resolve(dir) {
  return path.join(__dirname, dir);
}
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd();
  console.log(root);
  const env = loadEnv(mode, root, "") // 环境变量对象
  console.log(env);
  return {
    root: root,
    // 指定自定义HTML模板
    base: "",
    html: {
      template: "public/index.html"
    },
    publicDir: "public", // 静态资源服务的文件夹
    assetsInclude: resolve("./client/assets"),
    logLevel: "info", // 调整控制台输出的级别 'info' | 'warn' | 'error' | 'silent'
    plugins: [
      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy"],
          },
          // plugins: ["decorators-legacy", "class-properties-loose"],
          // plugins: [
          //   ["@babel/plugin-proposal-decorators", { legacy: true }],
          //   ["@babel/plugin-proposal-class-properties", { loose: true }]
          // ],
          // configFile: true
        }
      }),
      // gzip静态资源压缩
      compressPlugin({
        verbose: true,    // 默认即可
        disable: false,  // 开启压缩(不禁用)，默认即可
        deleteOriginFile: false, // 删除源文件
        threshold: 102400, // 压缩前最小文件大小
        algorithm: "gzip",  // 压缩算法
        ext: ".gz", // 文件类型
      })
    ],
    define: {
      "process.env": env
    },
    cacheDir: "node_modules/.vite", // 存储缓存文件的目录
    resolve: {
      alias: [
        { find: "@", replacement: resolve("client") }
      ],
      dedupe: [], // 强制 Vite 始终将列出的依赖项解析为同一副本
      conditions: [], // 解决程序包中 情景导出 时的其他允许条件
      mainFiles: ["client"],
      mainFields: ["module", "main", "browser"], // 解析包入口点尝试的字段列表
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"], // 导入时想要忽略的扩展名列表
      preserveSymlinks: false, // 启用此选项会使 Vite 通过原始文件路径确定文件身份
    },
    server: {
      https: false, // (使用https)启用 TLS + HTTP/2。注意：当 server.proxy 选项 也被使用时，将会仅使用 TLS
      host: true, // 使用当前的IP地址，没有这个就是以localhost作为本地地址
      port: 4000, // 端口号为3000
      open: false, // 是否在默认浏览器中自动打开该地址
      proxy: { // 使用代理
        // "/api": {
        //   target: env["VITE_REACT_APP_BASE_URL"],
        //   changeOrigin: true, // 是否跨域
        //   rewrite: (path) => path.replace(/^\/api/, "")
        // }
      },
      cors: true // 配置 CORS
    },
    // 最常见的用例是自定义 JSX

    esbuild: {
      // jsxInject: "import React from 'react'",
      jsxFactory: "h",
      jsxFragment: "Fragment"
    },
    // optimizeDeps: {
    //   include: ["@babel/plugin-proposal-decorators"]
    // },
    // ******项目构建配置******
    build: {
      target: "modules", // 设置最终构建的浏览器兼容目标  //es2015(编译成es5) | modules
      outDir: "dist", // 构建得包名  默认：dist
      assetsDir: "static", // 静态资源得存放路径文件名  assets
      assetsInlineLimit: 4096, // 小于此阈值的导入或引用资源将内联为 base64 编码
      cssCodeSplit: true, // 启用 CSS 代码拆分
      cssTarget: "", // 允许用户为 CSS 的压缩设置一个不同的浏览器 target 与 build.target 一致
      sourcemap: env["NODE_ENV"] !== "production", // 构建后是否生成 source map 文件
      rollupOptions: {
        input: {
          main: resolve("public/index.html")
        }
      }, // 自定义底层的 Rollup 打包配置
      lib: false, // 构建为库
      manifest: process.env["NODE_ENV"] !== "production", // 当设置为 true，构建后将会生成 manifest.json 文件
      ssrManifest: false, // 构建不生成 SSR 的 manifest 文件
      ssr: undefined, // 生成面向 SSR 的构建
      minify: "esbuild", // 指定使用哪种混淆器
      // terserOptions: {}, // 传递给 Terser 的更多 minify 选项
      write: true, // 启用将构建后的文件写入磁盘
      emptyOutDir: true, // 构建时清空该目录
      chunkSizeWarningLimit: 1024, // chunk 大小警告的限制
      watch: null, // 设置为 {} 则会启用 rollup 的监听器
    },
    //
    css: {
      // modules: {
      //   scopeBehaviour: 'global' // global | 'local'
      // },
      postcss: "",
      preprocessorOptions: {
        scss: {
          additionalData: '@import "./client/styles/mixin.scss";'
        },
        less: {
          additionalData: `@import "${resolve("./client/styles/antd-ui/variables.less")}";`
        }
      }
    },
    json: {
      namedExports: true, // 是否支持从.json文件中进行按名导入
      stringify: false, //  开启此项，导入的 JSON 会被转换为 export default JSON.parse("...") 会禁用按名导入
    }
  }
})
