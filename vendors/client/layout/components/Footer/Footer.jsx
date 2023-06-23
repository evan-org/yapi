import { Grid } from "@mui/material";
import React from "react";
import { Row, Col } from "antd";
import Icon from "@ant-design/icons";
//
import styles from "./Footer.module.scss";
//
const version = "1.0.0" // process.env.version;
//
const footList = [
  {
    title: "GitHub",
    iconType: "github",
    linkList: [
      {
        itemTitle: "YApi 源码仓库",
        itemLink: "https://github.com/YMFE/yapi"
      }
    ]
  },
  {
    title: "团队",
    iconType: "team",
    linkList: [
      {
        itemTitle: "YMFE",
        itemLink: "https://ymfe.org"
      }
    ]
  },
  {
    title: "反馈",
    iconType: "aliwangwang-o",
    linkList: [
      {
        itemTitle: "Github Issues",
        itemLink: "https://github.com/YMFE/yapi/issues"
      },
      {
        itemTitle: "Github Pull Requests",
        itemLink: "https://github.com/YMFE/yapi/pulls"
      }
    ]
  },
  {
    title: `Copyright © 2018-${new Date().getFullYear()} YMFE`,
    linkList: [
      {
        itemTitle: `版本: ${version} `,
        itemLink: "https://github.com/YMFE/yapi/blob/master/CHANGELOG.md"
      },
      {
        itemTitle: "使用文档",
        itemLink: "https://hellosean1025.github.io/yapi/"
      }
    ]
  }
]
function Main(props) {
  return (
    <footer className={styles.FooterWrapper}>
      <Grid container className="footer-container">
        {
          footList.map((item, index) => (
            <Grid item xs={3} key={index}>
              <h4 className="title">
                {item.iconType ? <Icon type={item.iconType} className="icon"/> : ""}
                {item.title}
              </h4>
              {
                item.linkList.map((item2, i2) => (
                  <p key={i2}>
                    <a href={item2.itemLink} className="link">
                      {item2.itemTitle}
                    </a>
                  </p>
                ))
              }
            </Grid>
          ))
        }
      </Grid>
    </footer>
  )
}
export default Main;
