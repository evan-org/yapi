import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Divider, Flex, Input, Spin, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
//
import { Box, List, ListItemAvatar, ListItemText, Typography, Avatar, ListItemButton } from "@mui/material";
//
import AddGroup from "@/components/AddGroup/AddGroup.jsx";
//
import { fetchNewsData } from "@/reducer/modules/news.js";
import { fetchGroupList, setCurrGroup, fetchGroupMsg } from "@/reducer/modules/group.js";
//
import styles from "./GroupList.module.scss";
import { useNavigate, useParams } from "react-router-dom";

const tip = (
  <div className="title-container">
    <h3 className="title">欢迎使用 YApi ~</h3>
    <p>
      这里的 <b>“个人空间”</b>{" "}
      是你自己才能看到的分组，你拥有这个分组的全部权限，可以在这个分组里探索 YApi 的功能。
    </p>
  </div>
);
//
function GroupList(props) {
  //
  const navigate = useNavigate();
  const { groupId: paramsGroupId } = useParams();
  const { currGroup, setCurrGroup, groupList, fetchGroupList, study, currentGroupId } = props;
  const [groupId, setGroupId] = useState(() => !isNaN(paramsGroupId) ? parseInt(paramsGroupId) : 0);
  //
  useEffect(() => {
    setSearchGroupList(() => groupList);
  }, [groupList]);
  //
  const [searchGroupList, setSearchGroupList] = useState(groupList);
  //
  const onLoad = async() => {
    console.debug("GroupList.jsx onLoad: ", props);
    console.debug("GroupList.jsx onLoad: ", paramsGroupId);
    //
    const req = await fetchGroupList();
    console.warn("GroupList.jsx fetchGroupList: ", req, groupList, groupId, !!groupId);
    if (groupId) {
      const _currGroup = groupList.find((e) => e._id === groupId);
      if (_currGroup) {
        setCurrGroup(_currGroup);
      }
    } else {
      // 没有id
      if (groupList.length > 0) {
        setGroupId(groupList[0]._id);
        setCurrGroup(groupList[0]);
        navigate(`/group/${groupList[0]._id}`);
      }
    }
  }
  //
  useEffect(() => {
    void onLoad();
  }, []);
  //
  const selectGroup = async(e) => {
    console.warn("GroupList.jsx selectGroup: ", e);
    const groupId = e.key;
    setGroupId(e.key);
    const currGroup = groupList.find((group) => group._id === groupId);
    if (currGroup) {
      setCurrGroup(currGroup);
      await fetchNewsData(groupId, "group", 1, 10);
      navigate(`${currGroup._id}`, { replace: true });
    }
  }
  //
  const searchGroup = (value, e) => {
    console.log(e);
    const v = value || e.target.value;
    console.log(v);
    if (v === "") {
      setSearchGroupList(groupList);
    } else {
      setSearchGroupList(() => groupList.filter((group) => new RegExp(v, "i").test(group.group_name)));
    }
  }
  //
  return (
    <div className={styles.GroupList}>
      {/* {!study ? <div className="study-mask"/> : null} */}
      {/* <Box className="curr-group">
          <Box component={"h3"} className="curr-group-name name">{currGroup.group_name}</Box>
          <Box component={"pre"} className="curr-group-desc">简介: {currGroup.group_desc}</Box>
        </Box> */}
      {/* <div className="group-operate">
          <div className="search">
            <Input.Search placeholder="搜索分类" onChange={(e) => searchGroup(e)} onSearch={(v) => searchGroup(null, v)}/>
          </div>
        </div> */}
      <div style={{ padding: "10px" }}>
        <Flex>
          <Input style={{ flex: 1 }} placeholder="搜索分类" allowClear onChange={(e) => searchGroup(e.target.value, e)} suffix={<SearchOutlined/>}/>
          <Tooltip title="添加分组">
            <AddGroup aria-label="添加分组" title={"添加分组"} type={"icon"}/>
          </Tooltip>
        </Flex>
      </div>
      <Divider style={{ margin: "0px" }}/>
      {/*  */}
      {groupList.length === 0 ? <Spin style={{ marginTop: 20, display: "flex", justifyContent: "center" }}/> : null}
      {/*  */}
      <Box component={"div"} style={{ flex: 1, overflow: "hidden", height: "100%" }}>
        <List sx={{ width: "100%", p: 0, maxWidth: "100%", bgcolor: "background.paper" }}>
          {
            searchGroupList.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={(event) => selectGroup({ ...item, key: item._id })}
                selected={groupId === item._id}>
                <ListItemAvatar>
                  <Avatar alt={item.group_name} src="/static/images/avatar/1.jpg"/>
                </ListItemAvatar>
                <ListItemText
                  sx={{ m: 0 }}
                  primary={item.group_name}
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: "inline" }} component="span" variant="body2" color="text.primary">
                        简介：
                      </Typography>
                      {item.group_desc}
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            ))
          }
        </List>
      </Box>
    </div>
  )
}
//
export default connect(
  (state) => ({
    groupList: state.group.groupList,
    currGroup: state.group.currGroup,
    currentGroupId: state.group.currentGroupId,
    curUserRole: state.user.role,
    curUserRoleInGroup: state.group.currGroup.role || state.group.role,
    studyTip: state.user.studyTip,
    study: state.user.study
  }),
  {
    fetchGroupList,
    setCurrGroup,
    fetchNewsData,
    fetchGroupMsg
  }
)(GroupList);
