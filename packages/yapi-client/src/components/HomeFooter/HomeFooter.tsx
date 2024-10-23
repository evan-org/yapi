"use client";
import React from "react";
import { AliwangwangOutlined, GithubOutlined, TeamOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";
//
import styles from "@/components/HomeFooter/HomeFooter.module.scss";
//
const version = "1.0.0" // process.env.version;
export default function HomeFooter() {
  const footList = [
    {
      title: "GitHub",
      iconType: "github",
      icon: <GithubOutlined/>,
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
      icon: <TeamOutlined/>,
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
      icon: <AliwangwangOutlined/>,
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
  ];
  return (
    <footer className={styles.FooterWrapper}>
      <Row className="footer-container">
        {
          footList.map((item, index) => (
            <Col span={6} key={index}>
              <h4 className="title">
                {item.icon}
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
            </Col>
          ))
        }
      </Row>
    </footer>
  )
}
