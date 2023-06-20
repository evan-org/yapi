import React, { PureComponent as Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Form, Button, Input, message } from "antd";
import Icon from "@ant-design/icons";
//
import { regActions } from "@/reducer/modules/user.js";

const formItemStyle = {
  marginBottom: "16px"
};

const changeHeight = {
  height: "42px"
};

class RegForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmDirty: false
    };
  }

  static propTypes = {
    form: PropTypes.object,
    history: PropTypes.object,
    regActions: PropTypes.func
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const form = this.props.form;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.regActions(values).then((res) => {
          if (res.payload.data.errcode == 0) {
            this.props.history.replace("/group");
            message.success("注册成功! ");
          }
        });
      }
    });
  };

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("两次输入的密码不一致啊!");
    } else {
      callback();
    }
  };

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit}>
        {/* 用户名 */}
        <Form.Item style={formItemStyle}>
          {getFieldDecorator("userName", {
            rules: [{ required: true, message: "请输入用户名!" }]
          })(
            <Input
              style={changeHeight}
              prefix={<Icon type="user" style={{ fontSize: 13 }}/>}
              placeholder="Username"
            />
          )}
        </Form.Item>
        {/* Emaiil */}
        <Form.Item style={formItemStyle}>
          {getFieldDecorator("email", {
            rules: [
              {
                required: true,
                message: "请输入email!",
                pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,})+$/
              }
            ]
          })(
            <Input
              style={changeHeight}
              prefix={<Icon type="mail" style={{ fontSize: 13 }}/>}
              placeholder="Email"
            />
          )}
        </Form.Item>
        {/* 密码 */}
        <Form.Item style={formItemStyle}>
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "请输入密码!"
              },
              {
                validator: this.checkConfirm
              }
            ]
          })(
            <Input
              style={changeHeight}
              prefix={<Icon type="lock" style={{ fontSize: 13 }}/>}
              type="password"
              placeholder="Password"
            />
          )}
        </Form.Item>
        {/* 密码二次确认 */}
        <Form.Item style={formItemStyle}>
          {getFieldDecorator("confirm", {
            rules: [
              {
                required: true,
                message: "请再次输入密码密码!"
              },
              {
                validator: this.checkPassword
              }
            ]
          })(
            <Input
              style={changeHeight}
              prefix={<Icon type="lock" style={{ fontSize: 13 }}/>}
              type="password"
              placeholder="Confirm Password"
            />
          )}
        </Form.Item>
        {/* 注册按钮 */}
        <Form.Item style={formItemStyle}>
          <Button
            style={changeHeight}
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            注册
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
export default connect(
  (state) => ({
    loginData: state.user
  }),
  {
    regActions
  }
)(RegForm);
