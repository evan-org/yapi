"use client";
import { useAppSelector } from "@/store/hooks";
import React from "react";
import ProjectList from "../ProjectList/ProjectList.jsx";
import MemberList from "../MemberList/MemberList.jsx";
import GroupLog from "../GroupLog/GroupLog.jsx";
import GroupSetting from "../GroupSetting/GroupSetting.jsx";
//
import { Tabs } from "antd";
import { useParams } from "next/navigation";
//
function GroupContent(props) {
  const params = useParams()
  console.log(props, params);
  const { curUserRole, currGroup, curUserRoleInGroup } = useAppSelector((state) => state.group);
  console.log("GroupContent", props);
  return (
    <Tabs type="card" className="m-tab tabs-large" style={{ height: "100%" }}>
      <Tabs.TabPane tab="项目列表" key="1">
        <ProjectList/>
      </Tabs.TabPane>
      {currGroup.type === "public" ? (
        <Tabs.TabPane tab="成员列表" key="2">
          <MemberList {...props}/>
        </Tabs.TabPane>
      ) : null}
      {["admin", "owner", "guest", "dev"].includes(curUserRoleInGroup) > -1 || curUserRole === "admin" ? (
        <Tabs.TabPane tab="分组动态" key="3">
          <GroupLog/>
        </Tabs.TabPane>
      ) : ("")
      }
      {(curUserRole === "admin" || curUserRoleInGroup === "owner") &&
      currGroup.type !== "private" ? (
          <Tabs.TabPane tab="分组设置" key="4">
            <GroupSetting/>
          </Tabs.TabPane>
        ) : null}
    </Tabs>
  )
}
export default GroupContent;
