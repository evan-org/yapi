const path = require("path");
module.exports = {
  mode: "development",
  devtool: "source-map",
  stats: "errors-only",
  output: {
    filename: "[name].bundle.js",
    publicPath: "/",
  },
  devServer: {
    port: "4000",
    proxy: [
      {
        context: ["/api", "/login"],
        // 转发端口自定义
        target: "http://127.0.0.1:3000",
        ws: true,
      },
    ],
    allowedHosts: ["localhost"],
    static: path.join(__dirname, "public"),
    compress: true,
    host: "localhost",
    hot: true,
    open: false,
    historyApiFallback: true,
  },
};
