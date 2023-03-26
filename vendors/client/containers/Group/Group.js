import React, { useState, useEffect } from "react";
import GroupList from "./GroupList/GroupList.js";
import ProjectList from "./ProjectList/ProjectList.js";
import MemberList from "./MemberList/MemberList.js";
import GroupLog from "./GroupLog/GroupLog.js";
import GroupSetting from "./GroupSetting/GroupSetting.js";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { Tabs, Layout, Spin } from "antd";

const TabPane = Tabs.TabPane;
//
const { Content, Sider } = Layout;
import { fetchNewsData } from "../../reducer/modules/news.js";
import { setCurrGroup } from "../../reducer/modules/group";
import "./Group.scss";
import axios from "axios";
//
function GroupContent(props) {
  return <Layout style={{ minHeight: "calc(100vh - 100px)", marginLeft: "24px", marginTop: "24px" }}>
    <Sider style={{ height: "100%" }} width={300}>
      <div className="logo"/>
      <GroupList/>
    </Sider>
    <Layout>
      <Content style={{ height: "100%", margin: "0 24px 0 16px", overflow: "initial", backgroundColor: "#fff" }}>
        <Tabs type="card" className="m-tab tabs-large" style={{ height: "100%" }}>
          <Tabs.TabPane tab="项目列表" key="1">
            <ProjectList/>
          </Tabs.TabPane>
          {props.currGroup.type === "public" ? (
            <Tabs.TabPane tab="成员列表" key="2">
              <MemberList/>
            </Tabs.TabPane>
          ) : null}
          {["admin", "owner", "guest", "dev"].indexOf(props.curUserRoleInGroup) > -1 || props.curUserRole === "admin" ? (
            <Tabs.TabPane tab="分组动态" key="3">
              <GroupLog/>
            </Tabs.TabPane>
          ) : ("")
          }
          {(props.curUserRole === "admin" || props.curUserRoleInGroup === "owner") &&
          props.currGroup.type !== "private" ? (
              <Tabs.TabPane tab="分组设置" key="4">
                <GroupSetting/>
              </Tabs.TabPane>
            ) : null}
        </Tabs>
      </Content>
    </Layout>
  </Layout>
}
function Group(props) {
  const [groupId, setGroupId] = useState(-1);
  async function init() {
    try {
      let r = await axios.get("/api/group/get_mygroup");
      const group = r.data.data;
      console.log("111111111", group, group._id);
      setGroupId(group._id);
      props.setCurrGroup(group)
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
    <div className="projectGround">
      <Switch>
        <Redirect exact from="/group" to={"/group/" + groupId}/>
        <Route path="/group/:groupId" render={() => <GroupContent props={props}/>}/>
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
