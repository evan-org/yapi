const { merge } = require("webpack-merge");
const baseConfig = require("./build/webpack.base.js");
const devConfig = require("./build/webpack.dev.js");
const prodConfig = require("./build/webpack.prod.js");
//
module.exports = (env, args) => {
  console.log(env, args);
  switch (args.mode) {
    case "development":
      return merge(baseConfig, devConfig);
    case "production":
      return merge(baseConfig, prodConfig);
    default:
      throw new Error("No matching configuration was found!");
  }
}
