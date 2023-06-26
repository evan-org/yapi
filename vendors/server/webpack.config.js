module.exports = {
  output: {
    publicPath: ""
  },
  // ... 其他配置
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}
