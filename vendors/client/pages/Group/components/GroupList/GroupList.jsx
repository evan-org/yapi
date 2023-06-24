import AddGroup from "@/components/AddGroup/AddGroup.jsx";
import { Box, List, ListItemAvatar, ListItemText, Typography, Avatar, Divider, ListItemButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Input, Spin, Menu, Popover, Tooltip } from "antd";
import Icon from "@ant-design/icons";
//
import GuideBtns from "@/components/GuideBtns/GuideBtns.jsx";
//
import { fetchNewsData } from "@/reducer/modules/news";
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
  const { currGroup, setCurrGroup, groupList, fetchGroupList, study, studyTip, currentGroupId } = props;
  const [groupId, setGroupId] = useState(null);
  //
  const navigate = useNavigate();
  const { groupId: paramsGroupId } = useParams();
  //
  const onLoad = async() => {
    console.debug("GroupList.jsx onLoad: ", props);
    console.debug("GroupList.jsx onLoad: ", paramsGroupId);
    //
    if (paramsGroupId !== undefined) {
      setGroupId(() => !isNaN(paramsGroupId) ? parseInt(paramsGroupId) : 0);
    }
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
    onLoad();
  }, []);
  //
  const selectGroup = async(e) => {
    console.warn("GroupList.jsx selectGroup: ", e);
    const groupId = e.key;
    const currGroup = groupList.find((group) => group._id === groupId);
    if (currGroup) {
      setCurrGroup(currGroup);
      await fetchNewsData(groupId, "group", 1, 10);
      navigate(`${currGroup._id}`, { replace: true });
    }
  }
  //
  const searchGroup = (e, value) => {
    const v = value || e.target.value;
    console.log(v);
    // const { groupList } = this.props;
    // if (v === "") {
    //   this.setState({ groupList });
    // } else {
    //   this.setState({
    //     groupList: groupList.filter((group) => new RegExp(v, "i").test(group.group_name))
    //   });
    // }
  }
  //
  return (
    <Box sx={{ height: "100%" }} className={styles.GroupList}>
      {!study ? <div className="study-mask"/> : null}
      <div className="group-bar">
        <div className="curr-group">
          <div className="curr-group-name">
            <span className="name">{currGroup.group_name}</span>
            <Tooltip title="添加分组">
              <span className="editSet">
                <AddGroup/>
              </span>
            </Tooltip>
          </div>
          <div className="curr-group-desc">简介: {currGroup.group_desc}</div>
        </div>
        <div className="group-operate">
          <div className="search">
            <Input.Search placeholder="搜索分类" onChange={(e) => searchGroup(e)} onSearch={(v) => searchGroup(null, v)}/>
          </div>
        </div>
        {groupList.length === 0 && <Spin style={{ marginTop: 20, display: "flex", justifyContent: "center" }}/>}
        {/*  */}
        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
          <Divider variant="fullWidth" component="li"/>
          {
            groupList.map((item, index) => (
              <Box key={index}>
                <ListItemButton alignItems="flex-start" key={index} divider={(groupList.length - 1) === index}
                  onClick={(event) => selectGroup({ ...item, key: item._id })}
                  selected={currentGroupId === item._id}>
                  <ListItemAvatar><Avatar alt="demo" src="/static/images/avatar/1.jpg"/></ListItemAvatar>
                  <ListItemText
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
                <Divider variant="inset" component="li"/>
              </Box>
            ))
          }
        </List>
        {/* <Menu className="group-list" mode="inline" onClick={selectGroup} selectedKeys={[`${currGroup._id}`]}>
          {
            groupList.map((group) => {
              if (group.type === "private") {
                return (
                  <Menu.Item key={`${group._id}`} className="group-item" style={{ zIndex: studyTip === 0 ? 3 : 1 }}>
                    <Icon type="user"/>
                    <Popover overlayClassName="popover-index" content={<GuideBtns/>} title={tip} placement="right"
                      visible={studyTip === 0 && !study}>
                      {group.group_name}
                    </Popover>
                  </Menu.Item>
                );
              } else {
                return (
                  <Menu.Item key={`${group._id}`} className="group-item">
                    <Icon type="folder-open"/>
                    {group.group_name}
                  </Menu.Item>
                );
              }
            })
          }
        </Menu> */}
      </div>
    </Box>
  )
}
//
GroupList.propTypes = {
  groupList: PropTypes.array,
  currGroup: PropTypes.object,
  fetchGroupList: PropTypes.func,
  setCurrGroup: PropTypes.func,
  match: PropTypes.object,
  history: PropTypes.object,
  curUserRole: PropTypes.string,
  curUserRoleInGroup: PropTypes.string,
  studyTip: PropTypes.number,
  study: PropTypes.bool,
  fetchNewsData: PropTypes.func,
  fetchGroupMsg: PropTypes.func
}
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
