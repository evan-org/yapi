import React, { PureComponent as Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
// import { Form, Button, Input, message, Radio } from "antd";
import Icon from "@ant-design/icons";
import { loginActions, loginLdapActions } from "@/reducer/modules/user.js";
import { useNavigate } from "react-router-dom";
//
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, TextField } from "@mui/material";

//
const formItemStyle = {
  marginBottom: "16px"
};
const changeHeight = {
  height: "42px"
};
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginType: "ldap"
    };
  }
  static propTypes = {
    form: PropTypes.object,
    history: PropTypes.object,
    loginActions: PropTypes.func,
    loginLdapActions: PropTypes.func,
    isLDAP: PropTypes.bool
  };
  handleSubmit = (e) => {
    e.preventDefault();
    const navigate = useNavigate();
    console.log("11111111111", navigate);
    //
    const form = this.props.form;
    form.validateFields((err, values) => {
      if (!err) {
        if (this.props.isLDAP && this.state.loginType === "ldap") {
          this.props.loginLdapActions(values).then((res) => {
            if (res.payload.data.errcode === 0) {
              navigate({ pathname: "/group" }, { replace: true });
              message.success("登录成功! ");
            }
          });
        } else {
          this.props.loginActions(values).then((res) => {
            console.log(res);
            if (res.payload.data.errcode === 0) {
              navigate({ pathname: "/group" }, { replace: true });
              message.success("登录成功! ");
            }
          });
        }
      }
    });
  };
  componentDidMount() {
    // Qsso.attach('qsso-login','/api/user/login_by_token')
    console.log("isLDAP", this.props.isLDAP);
  }
  handleFormLayoutChange = (e) => {
    this.setState({ loginType: e.target.value });
  };
  render() {
    console.log(this.props);
    const { getFieldDecorator } = this.props.form;
    const { isLDAP } = this.props;
    const emailRule =
      this.state.loginType === "ldap"
        ? {}
        : {
          required: true,
          message: "请输入正确的email!",
          pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{1,})+$/
        };
    return (
      <Form onSubmit={this.handleSubmit}>
        {/* 登录类型 (普通登录／LDAP登录) */}
        {isLDAP && (
          <Form.Item>
            <Radio.Group defaultValue="ldap" onChange={this.handleFormLayoutChange}>
              <Radio value="ldap">LDAP</Radio>
              <Radio value="normal">普通登录</Radio>
            </Radio.Group>
          </Form.Item>
        )}
        {/* 用户名 (Email) */}
        <Form.Item style={formItemStyle}>
          {getFieldDecorator("email", { rules: [emailRule] })(
            <Input
              style={changeHeight}
              prefix={<Icon type="user" style={{ fontSize: 13 }}/>}
              placeholder="Email"
            />
          )}
        </Form.Item>
        {/* 密码 */}
        <Form.Item style={formItemStyle}>
          {
            getFieldDecorator("password", { rules: [{ required: true, message: "请输入密码!" }] })(
              <Input style={changeHeight} prefix={<Icon type="lock" style={{ fontSize: 13 }}/>} type="password" placeholder="Password"/>
            )
          }
        </Form.Item>
        {/* 登录按钮 */}
        <Form.Item style={formItemStyle}>
          <Button style={changeHeight} type="primary" htmlType="submit"
            className="login-form-button">登录</Button>
        </Form.Item>
        {/* <div className="qsso-breakline">
          <span className="qsso-breakword">或</span>
        </div>
        <Button style={changeHeight} id="qsso-login" type="primary" className="login-form-button" size="large" ghost>QSSO登录</Button> */}
      </Form>
    );
  }
}
//
const validationSchema = Yup.object().shape({
  // name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});
//
const initialValues = {
  // name: "",
  email: "admin@admin.com",
  password: "ymfe.org",
};
function LoginFormMain(props) {
  console.log(props);
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    console.log("11111111111", e);
    const email = e.elements["email"].value;
    //
    console.log(email);
    e.preventDefault();
  };
  const onSubmit = async(values, { setSubmitting }) => {
    // setTimeout(() => {
    //   alert(JSON.stringify(values, null, 2));
    //   setSubmitting(false);
    // }, 400);
    console.log(values);
    try {
      //
      if (props.isLDAP && props.loginType === "ldap") {
        const res = await props.loginLdapActions(values)
        if (res.payload.data.errcode === 0) {
          navigate({ pathname: "/group" }, { replace: true });
          // message.success("登录成功! ");
        }
      } else {
        const res = await props.loginActions(values);
        console.debug("loginActions: ", res);
        if (res.payload.data.errcode === 0) {
          navigate({ pathname: "/group" }, { replace: true });
          // message.success("登录成功! ");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  //
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field
            name="email"
            label="Email"
            margin="normal"
            as={TextField}
            fullWidth
          />
          <Field
            name="password"
            label="Password"
            margin="normal"
            type="password"
            as={TextField}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
          >
            登录
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default connect(
  (state) => ({
    loginData: state.user,
    isLDAP: state.user.isLDAP
  }),
  {
    loginActions,
    loginLdapActions
  }
)(LoginFormMain);
