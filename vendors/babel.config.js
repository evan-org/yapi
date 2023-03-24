module.exports = {
  presets: [
    "@babel/preset-react",
    ["@babel/preset-env", { modules: "commonjs" }]
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    "@babel/plugin-proposal-class-properties",
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
      "babel-plugin-styled-components",
      {
        "displayName": false,
        "minify": true,
        "transpileTemplateLiterals": true,
        "ssr": false,
        "pure": true
      }
    ]
  ],
};
