import React from "react";
import { connect, useDispatch } from "react-redux";
import { loginActions, loginLdapActions } from "@/reducer/modules/user.js";
import { useNavigate } from "react-router-dom";
//
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Button, FormControl, TextField } from "@mui/material";
//
// import { pickRandomProperty } from "@/utils/common.mjs";
// import constants from "@/utils/variable.js";
//
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6).required("Password is required"),
});
//
function LoginFormMain(props) {
  const { isLDAP, loginType } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      "email": "admin@admin.com", // 账号
      "password": "ymfe.org", // 密码
    },
    validationSchema: validationSchema,
    onSubmit: async(values) => {
      try {
        if (isLDAP && loginType === "ldap") {
          const res = await dispatch(loginLdapActions(values));
          navigate({ pathname: `/group/${res.payload.uid}` }, { replace: true });
          // message.success("登录成功! ");
        } else {
          const res = await dispatch(loginActions(values));
          console.debug("loginActions: ", res);
          navigate({ pathname: `/group/${res.payload.uid}` }, { replace: true });
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
  })
)(LoginFormMain);
