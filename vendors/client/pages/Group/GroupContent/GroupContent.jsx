import React from "react";

import ProjectList from "../components/ProjectList/ProjectList.jsx";
import MemberList from "../components/MemberList/MemberList.jsx";
import GroupLog from "../components/GroupLog/GroupLog.jsx";
import GroupSetting from "../components/GroupSetting/GroupSetting.jsx";
//
import { Tabs } from "antd";
import { connect } from "react-redux";
import { fetchNewsData } from "@/reducer/modules/news";
import { setCurrGroup } from "@/reducer/modules/group";
/*
* connect(
  (state) => ({
    curGroupId: state.group.currGroup._id,
    curUserRole: state.user.role,
    curUserRoleInGroup: state.group.currGroup.role || state.group.role,
    currGroup: state.group.currGroup
  }),
  {
    fetchNewsData: fetchNewsData,
    setCurrGroup:
  setCurrGroup
  }
)(Group) */
function GroupContent(props) {
  const { curUserRole, currGroup, curUserRoleInGroup } = props;
  console.debug("GroupContent1", props);
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
export default connect(
  (state) => ({
    curGroupId: state.group.currGroup._id,
    curUserRole: state.user.role,
    curUserRoleInGroup: state.group.currGroup.role || state.group.role,
    currGroup: state.group.currGroup
  }),
  {
    fetchNewsData,
    setCurrGroup
  }
)(GroupContent)
