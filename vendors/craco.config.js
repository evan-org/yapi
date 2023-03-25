const path = require("path");
const fs = require("fs");
const { whenProd } = require("@craco/craco");
const CracoLessPlugin = require("craco-less");
// 打包gzip
const CompressionWebpackPlugin = require("compression-webpack-plugin");
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
  // reactScriptsVersion: "react-scripts",
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
  style: {
    // modules: {
    //   localIdentName: "[local]___[hash:base64:5]",
    // },
    sass: {
      loaderOptions: {
        // Prefer 'sass' (dart-sass) over 'node-sass' if both packages are installed.
        implementation: require("sass"),
        // Workaround for this bug: https://github.com/webpack-contrib/sass-loader/issues/804
        webpackImporter: true,
      },
    },
    //   postcss: {
    //     mode: "file",
    //   },
  },
  eslint: {
    mode: "file",
  },
  // env: {
  //   mode: "file"
  // },
  webpack: {
    // 别名
    alias: {
      "@": resolve("./client"),
      "src": resolve("./client"),
      "@client": resolve("./client"),
      "@common": resolve("./common"),
      "@exts": resolve("./exts")
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
      // console.log("configure new", paths, webpackConfig);
      webpackConfig.entry = resolve("./client/index.js");
      webpackConfig.output.path = resolve("./dist");
      // webpackConfig.output.publicPath = "/";
      if (env === "development") {
        webpackConfig.devtool = "cheap-module-source-map";
      }
      // webpackConfig.devtool = false;
      //
      console.log("configure new\n\n", webpackConfig);
      return webpackConfig;
      // return smp.wrap(webpackConfig);
    }
  },
  babel: {
    presets: [
      "@babel/preset-react",
      ["@babel/preset-env"]
    ],
    plugins: [
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      ["@babel/plugin-proposal-class-properties", { loose: true }],
      ["@babel/plugin-transform-runtime"],
      [
        "import",
        {
          libraryName: "antd",
          libraryDirectory: "es",
          style: "css",
        },
      ],
      // "react-refresh/babel"
    ],
    loaderOptions: (babelLoaderOptions, { env, paths }) => {
      console.log("babelLoaderOptions", babelLoaderOptions);
      return babelLoaderOptions;
    }
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    console.log("env, paths, proxy, allowedHost", env, paths, proxy, allowedHost);
    console.log("devServerConfig", devServerConfig);
    devServerConfig.static.publicPath.push(resolve("/"));
    devServerConfig.proxy = {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        source: true,
        pathRewrite: { "^/api": "/", "^/login": "/" }
      }
    }
    return devServerConfig
  },
  plugins: [
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
    /*  {
        plugin: CracoLessPlugin,
        options: {
          cssLoaderOptions: {
            modules: { localIdentName: "[local]_[hash:base64:5]" }
          },
          lessLoaderOptions: {
            lessOptions: {
              modifyVars: {
                "@primary-color": "#1DA57A",
                "@link-color": "#1DA57A",
                "@border-radius-base": "2px"
              },
              javascriptEnabled: true
            }
          }
        }
      },*/
    // {
    //   plugin: CracoLessPlugin,
    //   options: {
    //     // additionalData: `@import "${resolve("./client/styles/antd-ui/variables.less")}";`,
    //     modifyLessRule(lessRule, context) {
    //       // You have to exclude these file suffixes first,
    //       // if you want to modify the less module's suffix
    //       lessRule.exclude = /\.m\.less$/;
    //       return lessRule;
    //     },
    //     modifyLessModuleRule(lessModuleRule, context) {
    //       // Configure the file suffix
    //       lessModuleRule.test = /\.m\.less$/;
    //
    //       // Configure the generated local ident name.
    //       const cssLoader = lessModuleRule.use.find(loaderByName("css-loader"));
    //       cssLoader.options.modules = {
    //         localIdentName: "[local]_[hash:base64:5]",
    //       };
    //       return lessModuleRule;
    //     },
    //   },
    // },
    // {
    //   plugin: CracoAntDesignPlugin,
    //   options: {
    //     customizeThemeLessPath: resolve("./client/styles/antd-ui/variables.less")
    //   },
    // },
  ]
}
