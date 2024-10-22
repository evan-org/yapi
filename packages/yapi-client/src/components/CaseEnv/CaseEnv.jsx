// 测试集合中的环境切换
import React from "react";
import PropTypes from "prop-types";
import { Select, Row, Col, Collapse, Tooltip } from "antd";
import Icon from "@ant-design/icons";
//
import styles from "./CaseEnv.module.scss";

export default class CaseEnv extends React.Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    envList: PropTypes.array,
    currProjectEnvChange: PropTypes.func,
    changeClose: PropTypes.func,
    collapseKey: PropTypes.any,
    envValue: PropTypes.object
  };
  callback = (key) => {
    this.props.changeClose && this.props.changeClose(key);
  };
  render() {
    return (
      <Collapse style={{ margin: 0, marginBottom: "16px" }} onChange={this.callback} activeKey={this.props.collapseKey}>
        <Collapse.Panel key="1" header={
          <span>{" "}<span>选择测试用例环境</span>
            <Tooltip title="默认使用测试用例选择的环境">
              {" "}
              <Icon type="question-circle-o"/>{" "}
            </Tooltip>
          </span>
        }>
          <div className={styles.CaseEnv}>
            {this.props.envList.length > 0 && (
              <div>
                {this.props.envList.map((item) => (
                  <Row
                    key={item._id}
                    type="flex"
                    justify="space-around"
                    align="middle"
                    className="env-item"
                  >
                    <Col span={6} className="label">
                      <Tooltip title={item.name}>
                        <span className="label-name">{item.name}</span>
                      </Tooltip>
                    </Col>
                    <Col span={18}>
                      <Select
                        style={{
                          width: "100%"
                        }}
                        value={this.props.envValue[item._id] || ""}
                        defaultValue=""
                        onChange={(val) => this.props.currProjectEnvChange(val, item._id)}
                      >
                        <Select.Option key="default" value="">
                          默认环境
                        </Select.Option>
                        {item.env.map((key) => (
                          <Select.Option value={key.name} key={key._id}>
                            {key.name + ": " + key.domain}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                ))}
              </div>
            )}
          </div>
        </Collapse.Panel>
      </Collapse>
    );
  }
}
