import React, { useState, useEffect } from "react";
import GroupList from "./components/GroupList/GroupList.js";
import ProjectList from "./components/ProjectList/ProjectList.js";
import MemberList from "./components/MemberList/MemberList.js";
import GroupLog from "./components/GroupLog/GroupLog.js";
import GroupSetting from "./components/GroupSetting/GroupSetting.js";
//
import { connect } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { Tabs, Layout, Spin } from "antd";
//
import { fetchNewsData } from "../../reducer/modules/news.js";
import { setCurrGroup } from "../../reducer/modules/group";
//
import styles from "./Group.module.scss";
import axios from "axios";
//
function GroupSider() {
  return (
    <Layout.Sider style={{ height: "100%" }} width={300}>
      <div className="logo"/>
      <GroupList/>
    </Layout.Sider>
  )
}
//
function GroupContent(props) {
  const { curUserRole, currGroup, curUserRoleInGroup } = props;
  return (
    <Layout style={{ minHeight: "calc(100vh - 100px)", marginLeft: "24px", marginTop: "24px" }}>
      <GroupSider {...props}/>
      <Layout>
        <Layout.Content style={{ height: "100%", margin: "0 24px 0 16px", overflow: "initial", backgroundColor: "#fff" }}>
          <Tabs type="card" className="m-tab tabs-large" style={{ height: "100%" }}>
            <Tabs.TabPane tab="项目列表" key="1">
              <ProjectList {...props}/>
            </Tabs.TabPane>
            {currGroup.type === "public" ? (
              <Tabs.TabPane tab="成员列表" key="2">
                <MemberList {...props}/>
              </Tabs.TabPane>
            ) : null}
            {["admin", "owner", "guest", "dev"].indexOf(curUserRoleInGroup) > -1 || curUserRole === "admin" ? (
              <Tabs.TabPane tab="分组动态" key="3">
                <GroupLog {...props}/>
              </Tabs.TabPane>
            ) : ("")
            }
            {(curUserRole === "admin" || curUserRoleInGroup === "owner") &&
            currGroup.type !== "private" ? (
                <Tabs.TabPane tab="分组设置" key="4">
                  <GroupSetting {...props}/>
                </Tabs.TabPane>
              ) : null}
          </Tabs>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
function Group(props) {
  console.debug("1111111111111111111", props);
  const [groupId, setGroupId] = useState(() => props.curGroupId);
  async function init() {
    try {
      let r = await axios.get("/api/group/get_mygroup");
      const group = r.data.data;
      console.log("111111111", group, group._id);
      setGroupId(group._id);
      //
      const a = await props.setCurrGroup(group, "time");
      console.debug("1111111111111111111 1", a);
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    init();
  }, []);
  //
  if (groupId === -1) {
    return <Spin/>
  }
  return (
    <div className={styles.Group}>
      <Switch>
        <Redirect exact from="/group" to={"/group/" + groupId}/>
        <Route path="/group/:groupId" render={() => groupId !== -1 ? <GroupContent {...props}/> : null}/>
      </Switch>
    </div>
  );
}
export default connect(
  (state) => ({
    curGroupId: state.group.currGroup._id,
    curUserRole: state.user.role,
    curUserRoleInGroup: state.group.currGroup.role || state.group.role,
    currGroup: state.group.currGroup
  }),
  {
    fetchNewsData: fetchNewsData,
    setCurrGroup: setCurrGroup
  }
)(Group)
