const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const { HotModuleReplacementPlugin } = require("webpack");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
//
const devMode = process.env.NODE_ENV !== "production";
const resolve = (dir) => path.resolve(__dirname, "../", dir);
let isWin = require("os").platform() === "win32";
let commonLib = require("../common/plugin.js");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const webpack = require("webpack");
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
    publicPath: "/",
    filename: "static/js/[name].[contenthash:8].bundle.js",
    path: resolve("static/prd"),
    clean: true
  },
  cache: {
    type: "filesystem",
    cacheDirectory: resolve(__dirname, ".temp_cache"),
    buildDependencies: {
      config: [__filename],
    },
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
          // "thread-loader",
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
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]_[hash:base64:5]"
              }
            }
          },
          /* {
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
          }*/
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
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]_[hash:base64:5]"
              }
            }
          },
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
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]_[hash:base64:5]"
              }
            }
          },
          "less-loader"
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)(\?.+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1024,
              name: "static/img/[name].[ext]"
            },
          },
        ],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          }
        },
        generator: {
          filename: "static/media/[name].[contenthash:8].[ext]",
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          }
        },
        generator: {
          filename: "static/fonts/[name].[contenthash:8].[ext]",
        },
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
      filename: devMode ? "static/css/[name].[hash].css" : "static/css/[name].[hash].css",
      chunkFilename: devMode ? "static/css/[id].[hash].css" : "static/css/[id].[hash].css",
      ignoreOrder: true,
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      favicon: "./public/favicon.ico",
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
      },
    }),
    //
    // new HotModuleReplacementPlugin(), // HMR
  ],
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new OptimizeCSSAssetsPlugin({})
    ],
    runtimeChunk: "single",
    splitChunks: {
      minSize: 100000,
      maxSize: 300000,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/, // test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 10,
          name: "base",
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "async",
          priority: 9,
          minChunks: 2,
          name: "vendors",
        },
        styles: {
          test: /\.css$/,
          chunks: "all",
          enforce: true,
          priority: 20,
          name: "styles",
        },
      },
    },
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
