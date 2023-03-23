const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const devMode = process.env.NODE_ENV !== "production";
const resolve = (dir) => path.resolve(__dirname, "../", dir);
let isWin = require("os").platform() === "win32";
let commonLib = require("../common/plugin.js");
function createScript(plugin, pathAlias) {
  let options = plugin.options ? JSON.stringify(plugin.options) : null;
  if (pathAlias === "node_modules") {
    return `"${plugin.name}" : {module: require('yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
  }
  return `"${plugin.name}" : {module: require('${pathAlias}/yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
}
function initPlugins(configPlugin) {
  configPlugin = require("../../config.json").plugins;
  let systemConfigPlugin = require("../common/config.js").exts;
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
module.exports = {
  entry: {
    main: "./client/main.jsx",
    polyfill: ["buffer", "process", "util"]
  },
  output: {
    filename: "[name].bundle.[ext]",
    path: resolve("static/prd"),
    clean: true
  },
  cache: {
    type: "filesystem"
  },
  experiments: {
    topLevelAwait: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // exclude: /node_modules\/(?!(json-schema-editor-visual)\/).*/,
        exclude: isWin ? /(tui-editor|node_modules\\(?!_?(yapi-plugin|json-schema-editor-visual)))/ : /(tui-editor|node_modules\/(?!_?(yapi-plugin|json-schema-editor-visual)))/,
        use: [
          "thread-loader",
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: [
          // 待解决问题，使用 MiniCssExtractPlugin 会出现 codemirror 覆盖 toast-ui 样式问题
          // {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: {
          //     publicPath: './',
          //     esModule: true,
          //   },
          // },
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  require("autoprefixer"),
                  require("postcss-pxtorem")({
                    rootValue: 75,
                    propList: ["*"],
                  }),
                  require("cssnano")
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(sc|sa)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "./",
              // hmr: devMode
            }
          },
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "./",
              // hmr: devMode
            }
          },
          "css-loader",
          "less-loader"
        ]
      },
      {
        test: /\.(gif|jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/i,
        use: [
          {
            loader: "url-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
      util: "util"
    }),
    new CleanWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new MiniCssExtractPlugin({
      filename: devMode ? "css/[name].css" : "css/[name].[contenthash:8].css",
      chunkFilename: devMode ? "css/[id].css" : "css/[id].[contenthash:8].css"
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new HtmlWebpackPlugin({
      template: resolve("./public/index.html"),
      filename: "index.html"
    })
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 400000,
      cacheGroups: {
        commons: {
          chunks: "all",
          minChunks: 2,
          name: "commons",
          maxInitialRequests: 5
        }
        // npmVendor: {
        //   test: /[\\/]node_modules[\\/]/,
        //   name(module) {
        //     const packageName = module.context.match(
        //       /[\\/]node_modules[\\/](.*?)([\\/]|$)/
        //     )[1];
        //     return `npm.${packageName.replace("@", "")}`;
        //   }
        // }
      }
    },
    runtimeChunk: {
      name: "manifest"
    }
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".ts", ".js", ".jsx", ".css", ".json", ".string", ".tpl"],
    alias: {
      common: resolve("common"),
      client: resolve("client"),
      exts: resolve("exts")
    },
    // node 依赖特殊实现
    fallback: {
      "path": require.resolve("path-browserify"),
      "constants": require.resolve("constants-browserify"),
      "vm": require.resolve("vm-browserify"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "os": require("node-libs-browser").os,
      //
      "fs": false,
      "dns": false,
      "child_process": false,
      "net": false,
      "tls": false,
      "hmr": false,
      /**
       * "fs": require("node-libs-browser").fs,
       * "dns": require("node-libs-browser").dns,
       * "child_process": require("node-libs-browser").child_process,
       * "net": require("node-libs-browser").net,
       * "tls": require("node-libs-browser").tls
       * */
    }
  }
};
