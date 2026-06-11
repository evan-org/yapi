// @ts-nocheck
/**
 * user.validation 单元测试
 */
import test from "ava";
import {
  validateLoginCredentials,
  validateChangePasswordParams,
  validateRegisterFields,
  parseAvatarBasecode,
  resolveLdapIdentity,
} from "../../services/user.validation.js";

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

test("validateChangePasswordParams 缺少 uid", (t) => {
  const result = validateChangePasswordParams({ password: "x" });
  t.false(result.ok);
});

test("validateRegisterFields 缺少邮箱", (t) => {
  const result = validateRegisterFields({ password: "x" });
  t.false(result.ok);
  if (!result.ok) {
    t.is(result.message, "邮箱不能为空");
  }
});

test("parseAvatarBasecode 拒绝非法格式", (t) => {
  const result = parseAvatarBasecode("not-image-data");
  t.false(result.ok);
});

test("resolveLdapIdentity 解析邮箱与用户名", (t) => {
  const { emailParams, username } = resolveLdapIdentity(
    "user@corp.com",
    { mail: "ldap@test.com", cn: "LdapUser" },
    { emailKey: "mail", usernameKey: "cn" }
  );
  t.is(emailParams, "ldap@test.com");
  t.is(username, "LdapUser");
});
