const fs = require("fs");
const sysPath = require("path");
const css = fs.readFileSync(sysPath.join(__dirname, "./defaultTheme.scss"));
module.exports = "<style>" + css + "</style>";
