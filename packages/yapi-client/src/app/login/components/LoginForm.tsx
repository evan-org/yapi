"use client";
import React from "react";
import { Button, Checkbox, Form, Input, type FormProps } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { loginActions } from "@/store/slices/user";

const FormItem = Form.Item;
const InputPassword = Input.Password;
type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};
//
function LoginFormMain() {
  // const userState = useAppSelector((state: { user: any }) => state.user);
  const dispatch = useAppDispatch();
  // const isLDAP = userState.isLDAP;
  //
  const onFinish: FormProps<FieldType>["onFinish"] = async(values) => {
    console.log("Success:", values);
    try {
      const res = await dispatch(loginActions(values));
      console.debug("loginActions: ", res);
      // if (isLDAP && loginType === "ldap") {
      //   const res = await dispatch(loginLdapActions(values));
      //   console.log("loginLdapActions: ", res);
      //   // navigate({ pathname: `/group/${res.payload.uid}` }, { replace: true });
      //   // message.success("登录成功! ");
      // } else {
      //   const res = await dispatch(loginActions(values));
      //   console.debug("loginActions: ", res);
      //   // navigate({ pathname: `/group/${res.payload.uid}` }, { replace: true });
      //   // message.success("登录成功! ");
      // }
    } catch (e) {
      console.error(e);
    }
  };
  //
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  //
  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 600 }}
      initialValues={{
        "remember": true,
        "email": "admin@admin.com", // 账号
        "password": "ymfe.org", // 密码
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <FormItem<FieldType>
        label="Email"
        name="email"
        rules={[{ required: true, message: "Please input your email!" }]}
      >
        <Input/>
      </FormItem>
      <FormItem<FieldType>
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <InputPassword/>
      </FormItem>
      <FormItem<FieldType>
        name="remember"
        valuePropName="checked"
        wrapperCol={{ offset: 6, span: 16 }}
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Checkbox>Remember me</Checkbox>
      </FormItem>
      <FormItem wrapperCol={{ offset: 6, span: 24 }}>
        <Button type="primary" htmlType="submit" block>
          Submit
        </Button>
      </FormItem>
    </Form>
  )
}
export default LoginFormMain;
