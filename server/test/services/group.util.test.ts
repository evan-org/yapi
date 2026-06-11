// @ts-nocheck
/**
 * group.util 单元测试
 */
import test from "ava";
import {
  resolveMemberRole,
  enrichGroupForDisplay,
  GROUP_ROLE_LABEL,
} from "../../services/group.util.js";

test("resolveMemberRole 合法角色原样返回", (t) => {
  t.is(resolveMemberRole("owner"), "owner");
  t.is(resolveMemberRole("guest"), "guest");
});

test("resolveMemberRole 非法或空角色默认为 dev", (t) => {
  t.is(resolveMemberRole(undefined), "dev");
  t.is(resolveMemberRole("admin"), "dev");
});

test("enrichGroupForDisplay 私有空间显示个人空间", (t) => {
  const result = enrichGroupForDisplay({
    type: "private",
    group_name: "User-1",
  });
  t.is(result.group_name, "个人空间");
});

test("enrichGroupForDisplay 普通分组名称不变", (t) => {
  const result = enrichGroupForDisplay({
    type: "public",
    group_name: "研发团队",
  });
  t.is(result.group_name, "研发团队");
});

test("GROUP_ROLE_LABEL 包含三种角色文案", (t) => {
  t.is(GROUP_ROLE_LABEL.owner, "组长");
  t.is(GROUP_ROLE_LABEL.dev, "开发者");
  t.is(GROUP_ROLE_LABEL.guest, "访客");
});
