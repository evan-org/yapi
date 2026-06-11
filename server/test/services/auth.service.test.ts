// @ts-nocheck
import test from "ava";
import authService from "../../services/auth.service.js";

test("checkActionAllowed danger 仅 admin/owner", (t) => {
  t.true(authService.checkActionAllowed("admin", "danger"));
  t.true(authService.checkActionAllowed("owner", "danger"));
  t.false(authService.checkActionAllowed("dev", "danger"));
  t.false(authService.checkActionAllowed("guest", "danger"));
});

test("checkActionAllowed edit 允许 dev 及以上", (t) => {
  t.true(authService.checkActionAllowed("dev", "edit"));
  t.false(authService.checkActionAllowed("guest", "edit"));
});

test("checkActionAllowed view 允许 guest 及以上", (t) => {
  t.true(authService.checkActionAllowed("guest", "view"));
  t.false(authService.checkActionAllowed("member", "view"));
  t.false(authService.checkActionAllowed(false, "view"));
});
