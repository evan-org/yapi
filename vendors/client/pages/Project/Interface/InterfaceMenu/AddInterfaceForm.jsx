import React, { PureComponent as Component } from "react"
import PropTypes from "prop-types"
import { Form, Input, Select, Button } from "antd";

import constants from "@/utils/variable.js";
import { handleApiPath, nameLengthLimit } from "@/utils/common.js";
const HTTP_METHOD = constants.HTTP_METHOD;
const HTTP_METHOD_KEYS = Object.keys(HTTP_METHOD);

//
//
function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some((field) => fieldsError[field]);
}


class AddInterfaceForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    catid: PropTypes.number,
    catdata: PropTypes.array
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSubmit(values, () => {
          this.props.form.resetFields();
        });

      }
    });
  }

  handlePath = (e) => {
    let val = e.target.value
    this.props.form.setFieldsValue({
      path: handleApiPath(val)
    })
  }
  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;
    const prefixSelector = getFieldDecorator("method", {
      initialValue: "GET"
    })(
      <Select style={{ width: 75 }}>
        {HTTP_METHOD_KEYS.map((item) => <Select.Option key={item} value={item}>{item}</Select.Option>)}
      </Select>
    );
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    };


    return (

      <Form onSubmit={this.handleSubmit}>
        <Form.Item
          {...formItemLayout}
          label="接口分类"
        >
          {getFieldDecorator("catid", {
            initialValue: this.props.catid ? this.props.catid + "" : this.props.catdata[0]._id + ""
          })(
            <Select>
              {this.props.catdata.map((item) => <Select.Option key={item._id} value={item._id + ""}>{item.name}</Select.Option>)}
            </Select>
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="接口名称"
        >
          {getFieldDecorator("title", {
            rules: nameLengthLimit("接口")
          })(
            <Input placeholder="接口名称" />
          )}
        </Form.Item>

        <Form.Item
          {...formItemLayout}
          label="接口路径"
        >
          {getFieldDecorator("path", {
            rules: [{
              required: true, message: "请输入接口路径!"
            }]
          })(
            <Input onBlur={this.handlePath} addonBefore={prefixSelector} placeholder="/path" />
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="注"
        >
          <span style={{ color: "#929292" }}>详细的接口数据可以在编辑页面中添加</span>
        </Form.Item>
        <Form.Item className="catModalfoot" wrapperCol={{ span: 24, offset: 8 }} >
          <Button onClick={this.props.onCancel} style={{ marginRight: "10px" }}  >取消</Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={hasErrors(getFieldsError())}
          >
            提交
          </Button>
        </Form.Item>

      </Form>

    );
  }
}

export default AddInterfaceForm;
