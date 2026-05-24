/**
 * Vite 构建配置：开发端口 4000，生产输出 static/prd，base /prd/
 */
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import compressPlugin from "vite-plugin-compression";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDir(dir) {
  return path.join(__dirname, dir);
}

/** 将 client 下含 JSX 的 .js 文件预编译，兼容 CRA 时代命名 */
function jsxInJsPlugin() {
  return {
    name: "load+transform-js-files-as-jsx",
    enforce: "pre",
    async transform(code, id) {
      if (!/(\/client\/|\/exts\/|\/common\/).*\.js$/.test(id)) {
        return null;
      }
      if (!/<\s*[A-Za-z/]/.test(code)) {
        return null;
      }
      const { transform } = await import("esbuild");
      const result = await transform(code, {
        loader: "jsx",
        jsx: "automatic",
        sourcefile: id,
      });
      return {
        code: result.code,
        map: result.map || null,
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const isProd = mode === "production";

  return {
    root: __dirname,
    base: isProd ? "/prd/" : "/",
    publicDir: "public",
    plugins: [
      jsxInJsPlugin(),
      react({
        include: /\.(jsx|js)$/,
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { legacy: true }],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      }),
      ...(isProd
        ? [
            compressPlugin({
              verbose: true,
              disable: false,
              deleteOriginFile: false,
              threshold: 1024,
              algorithm: "gzip",
              ext: ".gz",
            }),
          ]
        : []),
    ],
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env": JSON.stringify({
        NODE_ENV: mode,
        ...env,
      }),
    },
    resolve: {
      alias: {
        "@": resolveDir("client"),
        client: resolveDir("client"),
        common: resolveDir("common"),
        exts: resolveDir("exts"),
        src: resolveDir("client"),
      },
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: true,
      port: 4000,
      open: false,
      proxy: {
        "/api": {
          target: env.VITE_DEV_API_PROXY || "http://127.0.0.1:3001",
          changeOrigin: true,
          ws: true,
        },
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/, /common\//, /exts\//, /client\/utils\//, /client\/components\/AceEditor\/utils\//],
        exclude: [/json-schema-editor-visual/],
      },
      outDir: "static/prd",
      emptyOutDir: true,
      assetsDir: "static",
      sourcemap: !isProd,
      chunkSizeWarningLimit: 2000,

    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
        scss: {},
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
      include: [
        "react",
        "react-dom",
        "react-redux",
        "react-router-dom",
        "antd",
        "brace",
        "brace/mode/javascript",
        "brace/mode/json",
        "jsondiffpatch/dist/jsondiffpatch.umd.js",
      ],
    },
  };
});
