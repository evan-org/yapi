const webpack = require("webpack");
const koaWebpackMiddleware = require("koa-webpack-middleware");
const webpackConfig = require("../webpack.config.js");
const compiler = webpack(webpackConfig);
function webpackMiddleware() {
  return koaWebpackMiddleware({
    compiler: compiler,
    hot: true,
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  })
}
module.exports = webpackMiddleware
