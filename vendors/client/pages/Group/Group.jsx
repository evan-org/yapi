import { Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import GroupList from "./components/GroupList/GroupList.jsx";
import GroupContent from "./components/GroupContent/GroupContent.jsx";
// import ProjectList from "./components/ProjectList/ProjectList.jsx";
// import MemberList from "./components/MemberList/MemberList.jsx";
// import GroupLog from "./components/GroupLog/GroupLog.jsx";
// import GroupSetting from "./components/GroupSetting/GroupSetting.jsx";
//
import { connect } from "react-redux";
import { Spin } from "antd";
//
// import { fetchNewsData } from "@/reducer/modules/news.js";
import { setCurrGroup } from "@/reducer/modules/group.js";
//
import styles from "./Group.module.scss";
import axios from "axios";
//
function Group(props) {
  console.debug("Group 1111111111111111111", props);
  const { curGroupId, setCurrGroup } = props;
  const [groupId, setGroupId] = useState(curGroupId ?? -1);
  //
  const init = async() => {
    try {
      const r = await axios.get("/api/group/get_mygroup");
      console.debug("/api/group/get_mygroup http", r);
      const group = r.data.data;
      setGroupId(group._id);
      //
      const a = await setCurrGroup(group, "time");
      console.debug("Group page setCurrGroup", a);
    } catch (e) {
      console.error(e)
    }
  }
  //
  useEffect(() => {
    init();
  }, []);
  //
  if (groupId === -1) {
    return <Spin/>
  }
  return (
    <Grid container spacing={0} className={styles.Group}>
      <Grid item xs={2}>
        <GroupList/>
      </Grid>
      <Grid item xs={10}>
        <GroupContent/>
      </Grid>
    </Grid>
  )
}
export default connect(
  (state) => ({
    curGroupId: state.group.currGroup._id,
  }),
  {
    setCurrGroup
  }
)(Group)
