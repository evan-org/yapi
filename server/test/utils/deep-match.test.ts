// @ts-nocheck
import test from "ava";
import { jsonEqual, isDeepMatch } from "../../utils/deep-match.js";

test("testJsonEqual", (t) => {
  let json1 = {
    a: "1",
    b: 2,
    c: {
      t: 3,
      x: [11, 22],
    },
  };

  let json2 = {
    c: {
      x: [11, 22],
      t: 3,
    },
    b: 2,
    a: "1",
  };
  t.true(jsonEqual(json1, json1));
});

test("testJsonEqualBase", (t) => {
  t.true(jsonEqual(1, 1));
});

test("testJsonEqualBaseString", (t) => {
  t.true(jsonEqual("2", "2"));
});

test("isDeepMatch", (t) => {
  t.true(isDeepMatch({ a: "aaaaa", b: 2 }, { a: "aaaaa" }));
});

test("isDeepMatch nested", (t) => {
  t.true(isDeepMatch({ a: 1, b: 2, c: { t: "ttt" } }, { c: { t: "ttt" } }));
});

test("isDeepMatch empty", (t) => {
  t.true(isDeepMatch({}, undefined));
});

test("isDeepMatch undefined obj", (t) => {
  t.true(isDeepMatch(undefined, {}));
});

test("isDeepMatch false", (t) => {
  t.false(isDeepMatch(undefined, { a: 1 }));
});

test("isDeepMatch mock case", (t) => {
  t.true(
    isDeepMatch(
      {
        t: 1,
        b: "2",
        ip: "127.0.0.1",
        interface_id: 1857,
        ip_enable: true,
        params: { a: "x", b: "y" },
        res_body: "111",
        code: 1,
      },
      { t: "1" }
    )
  );
});

test("isDeepMatch array", (t) => {
  t.true(isDeepMatch({ t: [{ a: 1 }] }, { t: [{ a: 1 }] }));
});

test("isDeepMatch array false", (t) => {
  t.false(isDeepMatch({ t: [{ a: 1, b: 12 }] }, { t: [{ a: 1 }] }));
});

test("isDeepMatch array root", (t) => {
  t.true(isDeepMatch([{ a: 1 }], [{ a: 1 }]));
});
