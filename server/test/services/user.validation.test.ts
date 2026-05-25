// @ts-nocheck
/**
 * user.validation 单元测试
 */
import test from "ava";
import { validateLoginCredentials } from "../../services/user.validation.js";

test("validateLoginCredentials 缺少 email", (t) => {
  const result = validateLoginCredentials({ email: "", password: "x" });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "email不能为空");
  }
});

test("validateLoginCredentials 缺少 password", (t) => {
  const result = validateLoginCredentials({ email: "a@b.com", password: "" });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.code, 400);
    t.is(result.message, "密码不能为空");
  }
});

test("validateLoginCredentials 成功时 trim email", (t) => {
  const result = validateLoginCredentials({
    email: "  user@test.com  ",
    password: "secret",
  });
  t.true(result.ok);
  if (result.ok) {
    t.is(result.data.email, "user@test.com");
    t.is(result.data.password, "secret");
  }
});
