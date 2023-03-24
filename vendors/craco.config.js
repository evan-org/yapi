const path = require("path");
const fs = require("fs");
// const CracoAntDesignPlugin = require("craco-antd");
const CracoLessPlugin = require("craco-less");
// const webpack = require("webpack");
const { whenProd } = require("@craco/craco");
// const CracoVtkPlugin = require('craco-vtk');
// 打包gzip
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// 打包进程分析
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
// 分析打包时间
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
// const smp = new SpeedMeasurePlugin();
//
// let isWin = require("os").platform() === "win32";
let commonLib = require("./common/plugin.js");
// const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
//
let { exts: systemConfigPlugin } = require("./common/config");
// const package = require("./package.json");
// const configPlugins = require("../config.json");
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
      mode: "file",
    },
  },
  eslint: {
    mode: "file",
  },
  webpack: {
    // 别名
    alias: {
      "src": resolve("client"),
      "@": resolve("client"),
      "client": resolve("client"),
      "common": resolve("common"),
      "exts": resolve("exts")
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
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = resolve("./dist");
      paths.appSrc = resolve("./client");
      paths.appIndexJs = resolve("./client/index.jsx");
      paths.swSrc = resolve("./client/service-worker.js");
      paths.testsSetup = resolve("./client/testsSetup.js");
      paths.proxySetup = resolve("./client/proxySetup.js");
      // console.log("configure new", paths, webpackConfig);
      webpackConfig.entry = resolve("./client/index.jsx");
      webpackConfig.output.path = resolve("./dist");
      webpackConfig.output.publicPath = "./";
      console.log("configure new", paths);
      // if (env === "development") {
      //   webpackConfig.devtool = "source-map";
      // }
      //
      webpackConfig.devtool = false;
      webpackConfig.optimization = {
        splitChunks: {
          chunks: "async",
          minSize: 40000,
          maxAsyncRequests: 5, // 最大异步请求数
          maxInitialRequests: 4, // 页面初始化最大异步请求数
          automaticNameDelimiter: "~", // 解决命名冲突
          // name: true值将会自动根据切割之前的代码块和缓存组键值(key)自动分配命名,否则就需要传入一个String或者function.
          name: true,
          cacheGroups: {
            common: {
              name: "chunk-common",
              chunks: "all",
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|redux-saga|dva|react-router-dom|draft-js\/lib|core-js|@antv\/data-set\/build|)[\\/]/,
              priority: -10,
            },
            antd: {
              name: "chunk-antd",
              chunks: "all",
              test: /[\\/]node_modules[\\/](@ant-design|antd|moment|immutable\/dist|rc-calendar\/es|braft-finder\/dist|lodash|rc-tree\/es)[\\/]/,
              priority: -11,
            },
            echarts: {
              name: "chunk-echarts",
              chunks: "all",
              test: /[\\/]node_modules[\\/](echarts)[\\/]/,
              priority: 10,
            },
          }
        }
      }
      //
      console.log("configure new\n\n", webpackConfig);
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
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-optional-chaining",
      ["@babel/transform-runtime"],
      [
        "import",
        {
          libraryName: "antd",
          libraryDirectory: "es",
          style: true,
        },
      ],
      [
        "babel-plugin-react-css-modules",
        {
          generateScopedName: "[local]___[hash:base64:5]",
          attributeNames: { activeStyleName: "activeClassName" },
        },
      ],
      [
        "babel-plugin-styled-components",
        {
          "displayName": false,
          "minify": true,
          "transpileTemplateLiterals": true,
          "ssr": false,
          "pure": true
        }
      ]
    ]
  },
  devServer: {
    port: 4000,
    proxy: [
      {
        context: ["/api", "/login"],
        // 转发端口自定义
        target: "http://127.0.0.1:3000",
        ws: true,
      },
    ],
    allowedHosts: ["localhost", "127.0.0.1"],
    // host: "0.0.0.0",
    hot: true,
    open: false,
    historyApiFallback: true,
  },
  plugins: [
    // 配置lessOptions
    {
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
    },
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
};
