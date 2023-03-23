//
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
// .BundleAnalyzerPlugin
const CompressionPlugin = require("compression-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
//
module.exports = {
  mode: "production",
  devtool: "none",
  output: {
    filename: "[name].[contenthash:8].bundle.js",
    publicPath: "/prd",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserJSPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  plugins: [
    new CompressionPlugin(),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    // }),
  ],
}
