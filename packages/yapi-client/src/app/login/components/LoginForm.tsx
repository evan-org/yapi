"use client";
import React from "react";
import { Flex, Button, Checkbox, Form, Input, type FormProps } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks.ts";
import { loginAction } from "@/store/slices/user.ts";
import { useRouter } from "next/navigation";

const FormItem = Form.Item;
const InputPassword = Input.Password;
type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};
//
export default function LoginFormMain() {
  const userState = useAppSelector((state: { user: any }) => state.user);
  const dispatch: any = useAppDispatch();
  const router = useRouter();
  // const isLDAP = userState.isLDAP;
  //
  const onFinish: FormProps<FieldType>["onFinish"] = async(values) => {
    console.log("Success:", values);
    try {
      const res = await dispatch(loginAction(values));
      console.log("loginActions: ", res);
      console.log("loginActions:userState: ", userState);
      router.push("/dashboard", { scroll: true });
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
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        "remember": false,
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
      <FormItem<FieldType>>
        <Flex justify="space-between" align="center">
          <FormItem<FieldType> name="remember" valuePropName="checked" noStyle
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error("Should accept agreement")),
              }
            ]}>
            <Checkbox>Remember me</Checkbox>
          </FormItem>
          <Button variant="link" color="primary" style={{ padding: "4px 0" }}>Forgot password</Button>
        </Flex>
      </FormItem>
      <FormItem>
        <Button type="primary" htmlType="submit" block>
          Submit
        </Button>
      </FormItem>
      <FormItem>
        <Button color="primary" variant="link" htmlType="button" href="/signin" block>
          Sign in
        </Button>
      </FormItem>
    </Form>
  )
};
