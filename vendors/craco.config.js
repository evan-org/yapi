const path = require("path");
const fs = require("fs");
const { whenProd, getLoader, loaderByName, removeLoaders, POSTCSS_MODES, ESLINT_MODES } = require("@craco/craco");
// const CracoEnvPlugin = require("craco-plugin-env");
// const CracoLessPlugin = require("craco-less");
// sass plugin 全局注入
const sassResourcesLoader = require("craco-sass-resources-loader");
// 打包gzip
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// 打包进程分析
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
// 分析打包时间
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
/* ********************************************************************** */
function createScript(plugin, pathAlias) {
  let options = plugin.options ? JSON.stringify(plugin.options) : null;
  if (pathAlias === "node_modules") {
    return `"${plugin.name}": { module: require("yapi-plugin-${plugin.name}/client.js"), options: ${options} }`;
  }
  return `"${plugin.name}": { module: require("${pathAlias}/yapi-plugin-${plugin.name}/client.js"), options: ${options} }`;
}
let { exts: extsConfig } = require("./common/config.js");
const commonLib = require("./common/plugin.js");
function initPlugins(configPlugin) {
  configPlugin = require("../config.json").plugins;
  let scripts = [];
  if (configPlugin && Array.isArray(configPlugin) && configPlugin.length) {
    configPlugin = commonLib.initPlugins(configPlugin, "plugin");
    configPlugin.forEach((plugin) => {
      if (plugin.client && plugin.enable) {
        scripts.push(createScript(plugin, "node_modules"));
      }
    });
  }
  const extConfig = commonLib.initPlugins(extsConfig, "ext");
  extConfig.forEach((plugin) => {
    if (plugin.client && plugin.enable) {
      scripts.push(createScript(plugin, "@exts"));
    }
  });
  scripts = "module.exports = {" + scripts.join(",") + "}";
  fs.writeFileSync(resolve("./client/plugin-module.js"), scripts);
}
initPlugins();
/* ********************************************************************** */
function resolve(dir) {
  return path.join(__dirname, dir);
}
//
module.exports = {
  // 配置打包后的文件位置
  reactScriptsVersion: "react-scripts",
  // style配置
  style: {
    modules: {
      localIdentName: "[local]___[hash:base64:5]",
    },
    sass: {
      loaderOptions: {
        // Prefer 'sass' (dart-sass) over 'node-sass' if both packages are installed.
        implementation: require("sass"),
        // Workaround for this bug: https://github.com/webpack-contrib/sass-loader/issues/804
        webpackImporter: false,
      },
    },
    postcss: {
      mode: POSTCSS_MODES.file,
    },
  },
  // babel配置
  babel: {
    presets: [
      "@babel/preset-react",
      ["@babel/preset-env", { modules: "auto" }]
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-proposal-private-methods", { loose: true }],
      ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
      ["babel-plugin-react-css-modules", {
        generateScopedName: "[local]___[hash:base64:5]",
        attributeNames: { activeStyleName: "activeClassName" },
      }],
      ["@babel/plugin-transform-modules-commonjs"],
      ["@babel/plugin-transform-runtime"],
      ["import", { libraryName: "antd", libraryDirectory: "es", style: "css" }]
    ]
  },
  // 开发服务器
  devServer: {
    host: "0.0.0.0",
    port: 4000,
    proxy: [{
      context: ["/api"],
      // 转发端口自定义
      target: "http://127.0.0.1:3030",
      changeOrigin: true,
      ws: true,
    }]
  },
  // craco的plugins
  plugins: [
    // env注入
    /* {
      plugin: CracoEnvPlugin,
      options: {
        variables: {}
      }
    }, */
    // 配置lessOptions
    /* {
      // 配置less支持
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {},
            javascriptEnabled: true,
          },
        },
      },
    }, */
    // 配置sass全局注入
    {
      plugin: sassResourcesLoader,
      options: {
        resources: ["./client/assets/styles/mixin.scss"],
        root: resolve("./client")
      },
    }
  ],
  // eslint
  eslint: {
    mode: ESLINT_MODES.file,
  },
  // webpack
  webpack: {
    context: resolve("./client"),
    // 别名
    alias: {
      "@": resolve("./client"),
      "@server": resolve("./server"),
      "@client": resolve("./client"),
      "@common": resolve("./common"),
      "@exts": resolve("./exts"),
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
    plugins: {
      add: [
        // 打压缩包
        ...whenProd(() => [
          new SimpleProgressWebpackPlugin(),
          new CompressionWebpackPlugin({
            algorithm: "gzip",
            test: new RegExp("\\.(" + ["js", "css"].join("|") + ")$"),
            threshold: 1024,
            minRatio: 0.8
          })
        ], [])
      ]
    },
    module: {
      // 独完整的 react.min.js 文件就没有采用模块化，忽略对 react.min.js 文件的递归解析处理
      noParse: [/node_modules\/jsondiffpatch\/public\/build\/.*js/, /tui-eritor/],
    },
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = resolve("./example/client");
      paths.appSrc = resolve("./client");
      paths.appIndexJs = resolve("./client/index.jsx");
      paths.swSrc = resolve("./client/service-worker.js");
      paths.testsSetup = resolve("./client/testsSetup.js");
      paths.proxySetup = resolve("./client/proxySetup.js");
      paths.publicUrlOrPath = "";
      webpackConfig.entry = resolve("./client/index.jsx");
      // console.log(paths);
      //
      const resolveUrlLoader = getLoader(webpackConfig, loaderByName("resolve-url-loader"));
      const babels = getLoader(webpackConfig, loaderByName("babel-loader"));
      if (babels.isFound) {
        babels.match.loader.include = resolve("./client");
      }
      // console.log(babels);
      if (resolveUrlLoader.isFound) {
        removeLoaders(webpackConfig, loaderByName("resolve-url-loader"));
        // resolveUrlLoader.match.loader.options.root = null;
      }
      //
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve(__dirname, "./example/client"), // 修改打包输出文件目录 两步都要写
        publicPath: whenProd(() => "/", "/"), // 静态资源publicpath
      }
      //
      // console.log("configure new\n\n", webpackConfig);
      //
      if (env === "development") {
        webpackConfig.devtool = "cheap-module-source-map";
        // webpackConfig.devtool = "source-map";
        console.log("当前是开发环境", env, "devtool:", webpackConfig.devtool);
        return webpackConfig;
      }
      //
      if (env === "production") {
        return smp.wrap(webpackConfig);
      }
    }
  }
}
