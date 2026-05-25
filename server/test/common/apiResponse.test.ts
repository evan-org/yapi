// @ts-nocheck
import test from "ava";
const {
  ApiCode,
  success,
  fail,
  isSuccess,
  isApiEnvelope,
  normalizeEnvelope,
  finalizeResponse,
  isRawResponsePath
} = require("../../common/apiResponse");

test("success 响应 errcode 为 0", (t) => {
  const body = success({ id: 1 });
  t.is(body.errcode, ApiCode.SUCCESS);
  t.is(body.errmsg, "成功！");
  t.deepEqual(body.data, { id: 1 });
  t.true(isSuccess(body));
});

test("fail 响应", (t) => {
  const body = fail(ApiCode.NOT_LOGIN, "请登录...");
  t.is(body.errcode, ApiCode.NOT_LOGIN);
  t.is(body.errmsg, "请登录...");
  t.is(body.data, null);
  t.false(isSuccess(body));
});

test("normalizeEnvelope 保留扩展字段", (t) => {
  const raw = {
    errcode: 0,
    errmsg: "成功！",
    data: { username: "a" },
    ladp: true,
    canRegister: false
  };
  const normalized = normalizeEnvelope(raw);
  t.is(normalized.ladp, true);
  t.is(normalized.canRegister, false);
  t.deepEqual(normalized.data, { username: "a" });
});

test("finalizeResponse 包装非信封对象", (t) => {
  const body = finalizeResponse("/api/foo/bar", { list: [] });
  t.true(isApiEnvelope(body));
  t.is(body.errcode, ApiCode.SUCCESS);
  t.deepEqual(body.data, { list: [] });
});

test("finalizeResponse 跳过原始路径", (t) => {
  t.true(isRawResponsePath("/api/user/avatar"));
  const raw = "binary";
  t.is(finalizeResponse("/api/user/avatar", raw), raw);
});

test("resReturn 兼容 commons", (t) => {
  const { resReturn } = require("../../utils/commons");
  const ok = resReturn({ a: 1 });
  t.is(ok.errcode, 0);
  const err = resReturn(null, 400, "参数错误");
  t.is(err.errcode, 400);
  t.is(err.data, null);
});
