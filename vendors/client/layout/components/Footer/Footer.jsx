import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import Icon from "@ant-design/icons";
//
import styles from "./Footer.module.scss";
//
const version = "1.0.0" // process.env.version;
//

function FootItem(props) {
  const {iconType, linkList, title} = props;
  return (
    <Col span={6}>
      <h4 className="title">
        {iconType ? <Icon type={iconType} className="icon"/> : ""}
        {title}
      </h4>
      {
        linkList.map((item, i) => (
          <p key={i}>
            <a href={item.itemLink} className="link">
              {item.itemTitle}
            </a>
          </p>
        ))
      }
    </Col>
  )
}
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
      <Row className="footer-container">
        {
          footList.map((item, index) => (
            <FootItem key={index} linkList={item.linkList} title={item.title} iconType={item.iconType}/>
          ))
        }
      </Row>
    </footer>
  )
}
export default Main;
