import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Select,
  InputNumber,
  Switch,
  Col,
  message,
  Row,
  Input,
  Button,
  AutoComplete,
  Modal
} from "antd";
import Icon from "@ant-design/icons";
//
import { safeAssign } from "@/utils/common.js";
import AceEditor from "@/components/AceEditor/AceEditor.jsx";
import constants from "@/utils/variable.js";
import "./CaseDesForm.module.scss";
import { connect } from "react-redux";
import json5 from "json5";
//
const httpCodes = [100, 101, 102, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 422, 423, 424, 426, 428, 429, 431, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511]
//
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 12 }
};
const formItemLayoutWithOutLabel = {
  wrapperCol: { span: 12, offset: 5 }
};
class CaseDesForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    caseData: PropTypes.object,
    currInterface: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    isAdd: PropTypes.bool,
    visible: PropTypes.bool
  };
  // 初始化输入数据
  preProcess = (caseData) => {
    try {
      caseData = JSON.parse(JSON.stringify(caseData));
    } catch (error) {
      console.log(error);
    }
    const initCaseData = {
      ip: "",
      ip_enable: false,
      name: "",
      code: "200",
      delay: 0,
      headers: [{ name: "", value: "" }],
      paramsArr: [{ name: "", value: "" }],
      params: {},
      res_body: "",
      paramsForm: "form"
    };
    caseData.params = caseData.params || {};
    const paramsArr = Object.keys(caseData.params).length
      ? Object.keys(caseData.params)
        .map((key) => ({ name: key, value: caseData.params[key] }))
        .filter((item) => {
          if (typeof item.value === "object") {
          // this.setState({ paramsForm: 'json' })
            caseData.paramsForm = "json";
          }
          return typeof item.value !== "object";
        })
      : [{ name: "", value: "" }];
    const headers =
      caseData.headers && caseData.headers.length ? caseData.headers : [{ name: "", value: "" }];
    caseData.code = "" + caseData.code;
    caseData.params = JSON.stringify(caseData.params, null, 2);
    caseData = safeAssign(initCaseData, { ...caseData, headers, paramsArr });
    return caseData;
  };
  constructor(props) {
    super(props);
    const { caseData } = this.props;
    this.state = this.preProcess(caseData);
  }
  // 处理request_body编译器
  handleRequestBody = (d) => {
    this.setState({ res_body: d.text });
  };
  // 处理参数编译器
  handleParams = (d) => {
    this.setState({ params: d.text });
  };
  // 增加参数信息
  addValues = (key) => {
    const { getFieldValue } = this.props.form;
    let values = getFieldValue(key);
    values = values.concat({ name: "", value: "" });
    this.setState({ [key]: values });
  };
  // 删除参数信息
  removeValues = (key, index) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    let values = getFieldValue(key);
    values = values.filter((val, index2) => index !== index2);
    setFieldsValue({ [key]: values });
    this.setState({ [key]: values });
  };
  // 处理参数
  getParamsKey = () => {
    let {
      req_query,
      req_body_form,
      req_body_type,
      method,
      req_body_other,
      req_body_is_json_schema,
      req_params
    } = this.props.currInterface;
    let keys = [];
    req_query &&
    Array.isArray(req_query) &&
    req_query.forEach((item) => {
      keys.push(item.name);
    });
    req_params &&
    Array.isArray(req_params) &&
    req_params.forEach((item) => {
      keys.push(item.name);
    });
    if (constants.HTTP_METHOD[method.toUpperCase()].request_body && req_body_type === "form") {
      req_body_form &&
      Array.isArray(req_body_form) &&
      req_body_form.forEach((item) => {
        keys.push(item.name);
      });
    } else if (
      constants.HTTP_METHOD[method.toUpperCase()].request_body &&
      req_body_type === "json" &&
      req_body_other
    ) {
      let bodyObj;
      try {
        // 针对json-schema的处理
        if (req_body_is_json_schema) {
          bodyObj = json5.parse(this.props.caseData.req_body_other);
        } else {
          bodyObj = json5.parse(req_body_other);
        }
        keys = keys.concat(Object.keys(bodyObj));
      } catch (error) {
        console.log(error);
      }
    }
    return keys;
  };
  endProcess = (caseData) => {
    const headers = [];
    const params = {};
    const { paramsForm } = this.state;
    caseData.headers &&
    Array.isArray(caseData.headers) &&
    caseData.headers.forEach((item) => {
      if (item.name) {
        headers.push({
          name: item.name,
          value: item.value
        });
      }
    });
    caseData.paramsArr &&
    Array.isArray(caseData.paramsArr) &&
    caseData.paramsArr.forEach((item) => {
      if (item.name) {
        params[item.name] = item.value;
      }
    });
    caseData.headers = headers;
    if (paramsForm === "form") {
      caseData.params = params;
    } else {
      try {
        caseData.params = json5.parse(caseData.params);
      } catch (error) {
        console.log(error);
        message.error("请求参数 json 格式有误，请修改");
        return false;
      }
    }
    delete caseData.paramsArr;
    return caseData;
  };
  handleOk = () => {
    const form = this.props.form;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.res_body = this.state.res_body;
        values.params = this.state.params;
        this.props.onOk(this.endProcess(values));
      }
    });
  };
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { isAdd, visible, onCancel } = this.props;
    const {
      name,
      code,
      headers,
      ip,
      ip_enable,
      params,
      paramsArr,
      paramsForm,
      res_body,
      delay
    } = this.state;
    this.props.form.initialValue;
    const valuesTpl = (values, title) => {
      const dataSource = this.getParamsKey();
      const display = paramsForm === "json" ? "none" : "";
      return values.map((item, index) => (
        <div key={index} className="paramsArr" style={{ display }}>
          <Form.Item
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            wrapperCol={index === 0 ? { span: 19 } : { span: 19, offset: 5 }}
            label={index ? "" : title}
          >
            <Row gutter={8}>
              <Col span={10}>
                <Form.Item>
                  {getFieldDecorator(`paramsArr[${index}].name`, { initialValue: item.name })(
                    <AutoComplete
                      dataSource={dataSource}
                      placeholder="参数名称"
                      filterOption={(inputValue, option) =>
                        option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item>
                  {getFieldDecorator(`paramsArr[${index}].value`, { initialValue: item.value })(
                    <Input placeholder="参数值"/>
                  )}
                </Form.Item>
              </Col>
              <Col span={4}>
                {values.length > 1 ? (
                  <Icon
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.removeValues("paramsArr", index)}
                  />
                ) : null}
              </Col>
            </Row>
          </Form.Item>
        </div>
      ));
    };
    const headersTpl = (values, title) => {
      const dataSource = constants.HTTP_REQUEST_HEADER;
      return values.map((item, index) => (
        <div key={index} className="headers">
          <Form.Item
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            wrapperCol={index === 0 ? { span: 19 } : { span: 19, offset: 5 }}
            label={index ? "" : title}
          >
            <Row gutter={8}>
              <Col span={10}>
                <Form.Item>
                  {getFieldDecorator(`headers[${index}].name`, { initialValue: item.name })(
                    <AutoComplete
                      dataSource={dataSource}
                      placeholder="参数名称"
                      filterOption={(inputValue, option) =>
                        option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item>
                  {getFieldDecorator(`headers[${index}].value`, { initialValue: item.value })(
                    <Input placeholder="参数值"/>
                  )}
                </Form.Item>
              </Col>
              <Col span={4}>
                {values.length > 1 ? (
                  <Icon
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.removeValues("headers", index)}
                  />
                ) : null}
              </Col>
            </Row>
          </Form.Item>
        </div>
      ));
    };
    return (
      <Modal
        title={isAdd ? "添加期望" : "编辑期望"}
        visible={visible}
        maskClosable={false}
        onOk={this.handleOk}
        width={780}
        onCancel={() => onCancel()}
        afterClose={() => this.setState({ paramsForm: "form" })}
        className="case-des-modal"
      >
        <Form onSubmit={this.handleOk}>
          <h2 className="sub-title" style={{ marginTop: 0 }}>
            基本信息
          </h2>
          <Form.Item {...formItemLayout} label="期望名称">
            {getFieldDecorator("name", {
              initialValue: name,
              rules: [{ required: true, message: "请输入期望名称！" }]
            })(<Input placeholder="请输入期望名称"/>)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="IP 过滤" className="ip-filter">
            <Col span={6} className="ip-switch">
              <Form.Item>
                {getFieldDecorator("ip_enable", {
                  initialValue: ip_enable,
                  valuePropName: "checked",
                  rules: [{ type: "boolean" }]
                })(<Switch/>)}
              </Form.Item>
            </Col>
            <Col span={18}>
              <div style={{ display: getFieldValue("ip_enable") ? "" : "none" }} className="ip">
                <Form.Item>
                  {getFieldDecorator(
                    "ip",
                    getFieldValue("ip_enable")
                      ? {
                        initialValue: ip,
                        rules: [
                          {
                            pattern: constants.IP_REGEXP,
                            message: "请填写正确的 IP 地址",
                            required: true
                          }
                        ]
                      }
                      : {}
                  )(<Input placeholder="请输入过滤的 IP 地址"/>)}
                </Form.Item>
              </div>
            </Col>
          </Form.Item>
          <Row className="params-form" style={{ marginBottom: 8 }}>
            <Col {...{ span: 12, offset: 5 }}>
              <Switch
                size="small"
                checkedChildren="JSON"
                unCheckedChildren="JSON"
                checked={paramsForm === "json"}
                onChange={(bool) => {
                  this.setState({ paramsForm: bool ? "json" : "form" });
                }}
              />
            </Col>
          </Row>
          {valuesTpl(paramsArr, "参数过滤")}
          <Form.Item
            wrapperCol={{ span: 6, offset: 5 }}
            style={{ display: paramsForm === "form" ? "" : "none" }}
          >
            <Button
              size="default"
              type="primary"
              onClick={() => this.addValues("paramsArr")}
              style={{ width: "100%" }}
            >
              <Icon type="plus"/> 添加参数
            </Button>
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            wrapperCol={{ span: 17 }}
            label="参数过滤"
            style={{ display: paramsForm === "form" ? "none" : "" }}
          >
            <AceEditor className="pretty-editor" data={params} onChange={this.handleParams}/>
            <Form.Item>
              {getFieldDecorator(
                "params",
                paramsForm === "json"
                  ? {
                    rules: [
                      { validator: this.jsonValidator, message: "请输入正确的 JSON 字符串！" }
                    ]
                  }
                  : {}
              )(<Input style={{ display: "none" }}/>)}
            </Form.Item>
          </Form.Item>
          <h2 className="sub-title">响应</h2>
          <Form.Item {...formItemLayout} required label="HTTP Code">
            {getFieldDecorator("code", {
              initialValue: code
            })(
              <Select showSearch>
                {httpCodes.map((code) => (
                  <Select.Option key={"" + code} value={"" + code}>
                    {"" + code}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item {...formItemLayout} label="延时">
            {getFieldDecorator("delay", {
              initialValue: delay,
              rules: [{ required: true, message: "请输入延时时间！", type: "integer" }]
            })(<InputNumber placeholder="请输入延时时间" min={0}/>)}
            <span>ms</span>
          </Form.Item>
          {headersTpl(headers, "HTTP 头")}
          <Form.Item wrapperCol={{ span: 6, offset: 5 }}>
            <Button
              size="default"
              type="primary"
              onClick={() => this.addValues("headers")}
              style={{ width: "100%" }}
            >
              <Icon type="plus"/> 添加 HTTP 头
            </Button>
          </Form.Item>
          <Form.Item {...formItemLayout} wrapperCol={{ span: 17 }} label="Body" required>
            <Form.Item>
              <AceEditor
                className="pretty-editor"
                data={res_body}
                mode={this.props.currInterface.res_body_type === "json" ? null : "text"}
                onChange={this.handleRequestBody}
              />
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
//
export default connect((state) => ({
  currInterface: state.inter.curdata
}))(CaseDesForm);