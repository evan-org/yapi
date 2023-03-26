const path = require("path");
const fs = require("fs");
const { whenProd, getLoader, loaderByName, removeLoaders } = require("@craco/craco");
const CracoEnvPlugin = require("craco-plugin-env")
const CracoLessPlugin = require("craco-less");
// 打包gzip
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const sassResourcesLoader = require("craco-sass-resources-loader");
// 打包进程分析
// const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
// 分析打包时间
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();
//
// let isWin = require("os").platform() === "win32";
let commonLib = require("./common/plugin.js");
// const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
//
let { exts: systemConfigPlugin } = require("./common/config");
function createScript(plugin, pathAlias) {
  let options = plugin.options ? JSON.stringify(plugin.options) : null;
  if (pathAlias === "node_modules") {
    return `"${plugin.name}" : {module: require('yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
  }
  return `"${plugin.name}" : {module: require('${pathAlias}/yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
}
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
  systemConfigPlugin = commonLib.initPlugins(systemConfigPlugin, "ext");
  systemConfigPlugin.forEach((plugin) => {
    if (plugin.client && plugin.enable) {
      scripts.push(createScript(plugin, "exts"));
    }
  });
  scripts = "module.exports = {" + scripts.join(",") + "}";
  fs.writeFileSync(resolve("./client/plugin-module.js"), scripts);
}
initPlugins();
function resolve(dir) {
  return path.join(__dirname, dir);
}
/**
 * @name invade
 * @param target: 要遍历的对象
 * @param name: 插件名
 * @param callback: 回调函数，第一个参数为该插件对象
 * @return null
 */
function invade(target, name, callback) {
  target.forEach((item) => {
    if (item.constructor.name === name) {
      callback(item);
    }
  });
}
let isWin = require("os").platform() === "win32";
//
module.exports = {
  reactScriptsVersion: "react-scripts",
  // 配置打包后的文件位置
  /* style: {
    modules: {
      localIdentName: ''
    },
    css: {
      // loaderOptions: { /!* Any css-loader configuration options: https://github.com/webpack-contrib/css-loader. *!/ },
      loaderOptions: (cssLoaderOptions, { env, paths }) => cssLoaderOptions
    },
    sass: {
      // loaderOptions: { /!* Any sass-loader configuration options: https://github.com/webpack-contrib/sass-loader. *!/ },
      loaderOptions: (sassLoaderOptions, { env, paths }) => sassLoaderOptions
    },
    postcss: {
      mode: 'extends' /!* (default value) *!/ || 'file',
      // plugins: [require('plugin-to-append')], // Additional plugins given in an array are appended to existing config.
      plugins: (plugins) => plugins,
      // plugins: (plugins) => [require('plugin-to-prepend')].concat(plugins), // Or you may use the function variant.
      env: {
        autoprefixer: { /!* Any autoprefixer options: https://github.com/postcss/autoprefixer#options *!/ },
        stage: 3, /!* Any valid stages: https://cssdb.org/#staging-process. *!/
        features: { /!* Any CSS features: https://preset-env.cssdb.org/features. *!/ }
      },
      // loaderOptions: { /!* Any postcss-loader configuration options: https://github.com/postcss/postcss-loader. *!/ },
      loaderOptions: (postcssLoaderOptions, { env, paths }) => postcssLoaderOptions
    }
  },*/
  // env: {
  //   mode: "file"
  // },
  webpack: {
    context: resolve("./client"),
    // 别名
    alias: {
      "@": resolve("./client"),
      "src": resolve("./client"),
      "client": resolve("./client"),
      "common": resolve("./common"),
      "exts": resolve("./exts")
    },
    plugins: {
      add: [
        // 打压缩包
        ...whenProd(() => [
          // new SimpleProgressWebpackPlugin(),
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
      paths.appBuild = resolve("./dist");
      paths.appSrc = resolve("./client");
      paths.appIndexJs = resolve("./client/index.js");
      paths.swSrc = resolve("./client/service-worker.js");
      paths.testsSetup = resolve("./client/testsSetup.js");
      paths.proxySetup = resolve("./client/proxySetup.js");
      webpackConfig.entry = resolve("./client/index.js");
      //
      const { isFound, match } = getLoader(webpackConfig, loaderByName("resolve-url-loader"));
      if (isFound) {
        removeLoaders(webpackConfig, loaderByName("resolve-url-loader"));
        // console.log(match, webpackConfig.module.rules[1].oneOf);
        // const { isFound, match } = getLoader(match.p, loaderByName("resolve-url-loader"));
        // match.parent.forEach((e) => {
        //   console.log(e);
        //   if (typeof e === "object" && e.loader.indexOf("resolve-url-loader") > -1) {
        //     e.options.root = resolve("./client");
        //   }
        // })
        // webpackConfig.module.rules[index].loader.options.root = resolve("./client");
        // match.loader.options.root = resolve("./client");
      }
      //
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve(__dirname, "dist"), // 修改打包输出文件目录 两步都要写
        publicPath: whenProd(() => "/", "/"), // 静态资源publicpath
      }
      if (env === "development") {
        webpackConfig.devtool = "cheap-module-source-map";
        console.log("当前是开发环境", env, "devtool:", "cheap-module-source-map");
      }
      // webpackConfig.devtool = false;
      //
      console.log("configure new\n\n", JSON.stringify(webpackConfig.module.rules));
      return webpackConfig;
      // return smp.wrap(webpackConfig);
    }
  },
  babel: {
    presets: [
      "@babel/preset-react",
      ["@babel/preset-env", { modules: "commonjs" }]
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties"],
      ["@babel/plugin-transform-runtime"],
      [
        "import",
        {
          libraryName: "antd",
          libraryDirectory: "es",
          style: "css",
        },
      ]
    ],
    loaderOptions: (babelLoaderOptions, { env, paths }) =>
      // console.log("babelLoaderOptions", babelLoaderOptions);
      babelLoaderOptions
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    devServerConfig = {
      ...devServerConfig,
      publicPath: "/",
      host: "localhost",
      public: "localhost",
      overlay: true,
      port: 4000,
      hot: true,
      proxy: [{
        context: ["/api"],
        // 转发端口自定义
        target: "http://127.0.0.1:3030",
        changeOrigin: true,
        ws: true,
      }]
    }
    return devServerConfig
  },
  plugins: [
    {
      plugin: CracoEnvPlugin,
      options: {
        variables: {}
      }
    },
    // 配置lessOptions
    {
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
    },
    {
      plugin: sassResourcesLoader,
      options: {
        resources: ["./client/styles/mixin.scss"],
        root: resolve("./client")
      },
    }
  ],
  eslint: {
    mode: "file",
  },
}
