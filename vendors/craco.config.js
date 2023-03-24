const path = require("path");
const fs = require("fs");
// const webpack = require("webpack");
const { whenProd, whenDev } = require("@craco/craco");
const CracoLessPlugin = require("craco-less");
// const CracoVtkPlugin = require('craco-vtk');
// 打包gzip
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// 打包进程分析
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");
// 分析打包时间
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
//
let isWin = require("os").platform() === "win32";
let commonLib = require("./common/plugin.js");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
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
//
module.exports = {
  // reactScriptsVersion: 'react-scripts',
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
  webpack: {
    // 别名
    alias: {
      "src": resolve("client"),
      "@": resolve("client"),
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
      console.log("configure", webpackConfig);
      webpackConfig.entry = resolve("./client/main");
      const widthProd = whenProd(() => {
        //
        paths.appBuild = resolve("./dist");
        paths.publicUrlOrPath = "./";
        webpackConfig.output.path = resolve("./dist");
        webpackConfig.output.publicPath = "./";
        // 关闭生产环境 devtool
        // config.devtool = false
        // 美化打包后 js 文件名
        // webpackConfig.output = {
        //   ...webpackConfig.output,
        //   chunkFilename: webpackConfig.output.chunkFilename.replace('.chunk', '')
        // }
        // 美化打包后 css 文件名
        // invade(webpackConfig.plugins, 'MiniCssExtractPlugin', (e) => {
        //   e.options.chunkFilename = e.options.chunkFilename.replace('.chunk', '');
        // });
        // 压缩 optimization
        invade(webpackConfig.optimization.minimizer, "TerserPlugin", (e) => {
          // 去除 LICENSE.txt
          e.options.extractComments = false;
          // 去除生产环境 console.log
          e.options.terserOptions.compress.drop_console = true;
        });
        // 分析
        console.log(webpackConfig, paths);
        return smp.wrap(webpackConfig)
      }, webpackConfig)
      console.log(widthProd);
      return widthProd
    }
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    console.log(devServerConfig);
    // devServerConfig.client.webSocketURL.hostname = 'localhost';
    // devServerConfig.client.webSocketURL.port = 8080;
    // devServerConfig.static = './public';
    devServerConfig.proxy = {
      "/api": {
        target: process.env["REACT_APP_BASE_URL"],
        changeOrigin: true,
        source: true,
        pathRewrite: { "^/api": "/" }
      }
    }
    return devServerConfig
  },
  plugins: [
    // 配置lessOptions
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          additionalData: `@import "${resolve("./client/styles/antd-ui/variables.less")}";`,
          lessOptions: {
            // modifyVars: {
            //   '@primary-color': '#1DA57A',
            //   '@link-color': '#1DA57A',
            //   '@border-radius-base': '2px',
            // },
            javascriptEnabled: true,
          },
        },
      }
    }
  ]
};
