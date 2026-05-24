import { createTheme } from "@mui/material/styles";

/**
 * YApi MUI 主题（与历史主色 #2395f1 对齐）
 * htmlFontSize 与 rem 布局（html { font-size: 100px }）一致
 */
const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#2395f1"
    },
    success: {
      main: "#57cf27"
    },
    error: {
      main: "#ff561b"
    },
    warning: {
      main: "#fac200"
    }
  },
  typography: {
    htmlFontSize: 100,
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Helvetica",
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft YaHei"',
      "SimSun",
      "sans-serif"
    ].join(",")
  }
});

export default muiTheme;
