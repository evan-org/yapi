// import { pickRandomProperty } from "@/utils/common.js";
// import constants from "@/utils/variable.js";
import React, { PureComponent as Component } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
// import { Form, Button, Input, message, Radio } from "antd";
// import Icon from "@ant-design/icons";
import { loginActions, loginLdapActions } from "@/reducer/modules/user.js";
import { useNavigate } from "react-router-dom";
//
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, FormControl, TextField } from "@mui/material";
//
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});
//
function LoginFormMain(props) {
  const { isLDAP, loginType, loginLdapActions, loginActions } = props;
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      "email": "admin@admin.com", // 账号
      "password": "ymfe.org", // 密码
    },
    validationSchema: validationSchema,
    onSubmit: async(values) => {
      try {
        if (isLDAP && loginType === "ldap") {
          const res = await loginLdapActions(values);
          navigate({ pathname: `/group/${res.payload.data.uid}` }, { replace: true });
          // message.success("登录成功! ");
        } else {
          const res = await loginActions(values);
          console.debug("loginActions: ", res);
          navigate({ pathname: `/group/${res.payload.data.uid}` }, { replace: true });
          // message.success("登录成功! ");
        }
      } catch (e) {
        console.error(e);
      }
    }
  })
  //
  return (
    <Box sx={{ minWidth: 120, m: 1 }} component={"form"} onSubmit={formik.handleSubmit}>
      <TextField sx={{ mb: 2 }} fullWidth label="邮箱" placeholder={"请输入邮箱名称"} name={"email"} value={formik.values.email}
        error={Boolean(formik.touched.email && formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        onChange={formik.handleChange}/>
      <TextField sx={{ mb: 2 }} fullWidth label="密码" placeholder={"请输入密码"} name={"password"} value={formik.values.password}
        error={Boolean(formik.touched.password && formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        onChange={formik.handleChange}/>
      <FormControl sx={{ mb: 2 }} fullWidth>
        <Button variant="contained" color="primary" onClick={formik.handleSubmit} type={"submit"}>登录</Button>
      </FormControl>
    </Box>
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
