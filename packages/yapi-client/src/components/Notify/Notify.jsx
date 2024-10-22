import React, { Component } from "react";
import request from "@/service/request.js";
import { Alert, message } from "antd";
function isUpgrade(current_version, compare_version = "6.0.0") {
  let compare_version_array = compare_version.split(".");
  let current_version_array = current_version.split(".");
  let is_upgrade = true;
  if (compare_version_array.length === 3 && current_version_array.length === 3) {
    for (let i = 0; i < compare_version_array.length; i++) {
      if (parseInt(compare_version_array[i]) < parseInt(current_version_array[i])) {
        is_upgrade = true;
        break;
      } else {
        if (parseInt(compare_version_array[i]) === parseInt(current_version_array[i])) {
          continue;
        } else {
          is_upgrade = false;
          break;
        }
      }
    }
  }
  return is_upgrade;
}

export default class Notify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newVersion: "2.0.0", // process.env.version,
      version: "2.0.0" // process.env.version
    };
  }
  componentDidMount() {
    const versions = "https://www.fastmock.site/mock/1529fa78fa4c4880ad153d115084a940/yapi/versions";
    request.get(versions).then((req) => {
      if (req.status === 200) {
        this.setState({ newVersion: req.data.data[0] });
      } else {
        message.error("无法获取新版本信息！");
      }
    });
  }
  render() {
    const isShow = this.state.newVersion !== this.state.version;
    return (
      <>
        {isShow && (
          <Alert
            message={
              <div>
                当前版本是：{this.state.version}&nbsp;&nbsp;可升级到: {this.state.newVersion}
                &nbsp;&nbsp;&nbsp;
                <a
                  target="view_window"
                  href="https://github.com/YMFE/yapi/blob/master/CHANGELOG.md"
                >
                  版本详情
                </a>
              </div>
            }
            banner
            closable
            type="info"
          />
        )}
      </>
    );
  }
}
