"use client";
import React, { useState } from "react";
import { Form, Button, Input, message, Checkbox, type FormProps } from "antd";

const FormItem = Form.Item;
const InputPassword = Input.Password;
//
import { regActions } from "@/store/slices/user.ts";
import { useAppDispatch } from "@/store/hooks.ts";
import { useRouter } from "next/navigation";
//
type FieldType = {
  user?: string;
  email?: string;
  password?: string;
  confirm?: string;
  agreement?: boolean;
  remember?: boolean;
};
const tailFormItemLayout = {
  labelCol: {
    xs: { span: 0 },
    sm: { span: 0 },
  },
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 24,
      offset: 0,
    },
  },
};
export default function RegForm() {
  const [confirmDirty] = useState(false);
  const dispatch: any = useAppDispatch();
  const router = useRouter();
  const onFinish: FormProps<FieldType>["onFinish"] = async(values) => {
    console.log("Success:", values);
    try {
      const res = await dispatch(regActions(values));
      console.log("loginActions: ", res);
      message.success("注册成功! ");
      router.push("/dashboard", { scroll: true });
    } catch (e) {
      console.error(e);
    }
  };
  const checkConfirm = (_: any, value: any) => {
    if (value && confirmDirty) {
      // form.validateFields(["confirm"], { force: true });
    }
    return Promise.resolve();
  };
  //
  return (
    <Form
      name="basic"
      layout="vertical"
      style={{ maxWidth: 600 }}
      initialValues={{
        user: "",
        email: "",
        password: "",
        confirm: "",
        agreement: false,
        remember: true
      }}
      onFinish={onFinish}
      autoComplete={"off"}>
      {/* 用户名 */}
      <FormItem<FieldType>
        label="用户名"
        name="user"
        rules={[{ required: true, message: "请输入用户名!" }]}>
        <Input
          placeholder="Username"
        />
      </FormItem>
      {/* Email */}
      <FormItem<FieldType>
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            message: "请输入email!",
            pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,})+$/
          }
        ]}>
        <Input
          placeholder="Email"
        />
      </FormItem>
      {/* 密码 */}
      <FormItem<FieldType>
        label={"密码"}
        name="password"
        rules={[
          {
            required: true,
            message: "请输入密码!"
          },
          {
            validator: checkConfirm
          }
        ]}>
        <InputPassword placeholder="Password"/>
      </FormItem>

      {/* 密码二次确认 */}
      <FormItem<FieldType>
        label={"密码二次确认"}
        name="confirm"
        dependencies={["password"]}
        rules={[
          {
            required: true,
            message: "请再次输入密码密码!"
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("The new password that you entered do not match!"));
            },
          })
        ]}>
        <InputPassword placeholder="Confirm Password"/>
      </FormItem>
      {/* 同意协议 */}
      <FormItem<FieldType>
        name="agreement"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error("Should accept agreement")),
          },
        ]}
        {...tailFormItemLayout}
      >
        <Checkbox>
          I have read the <a href="/agreement">agreement</a>
        </Checkbox>
      </FormItem>
      {/* 注册按钮 */}
      <FormItem<FieldType>>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          block
        >
          注册
        </Button>
      </FormItem>
    </Form>
  );
}
