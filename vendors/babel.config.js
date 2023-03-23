module.exports = {
  presets: [
    "@babel/preset-react",
    "@babel/preset-env"
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ["@babel/transform-runtime"],
    [
      "import",
      {
        libraryName: "antd",
        style: true,
      },
    ],
  ],
};
