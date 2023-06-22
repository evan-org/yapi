import { Box } from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Modal, Input, message, Spin, Row, Menu, Col, Popover, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import axios from "axios";
//
import UsernameAutoComplete from "@/components/UsernameAutoComplete/UsernameAutoComplete.jsx";
import GuideBtns from "@/components/GuideBtns/GuideBtns.jsx";
//
import { fetchNewsData } from "@/reducer/modules/news";
import { fetchGroupList, setCurrGroup, fetchGroupMsg } from "@/reducer/modules/group.js";
import _ from "underscore";
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
function AddGroupModal(props) {
  const {
    addGroupModalVisible, inputNewGroupName, inputNewGroupDesc,
    hideModal, setOwner_uids, addGroup
  } = props;
  const onUserSelect = (uids) => setOwner_uids(uids);
  return (
    <Modal title="添加分组" visible={addGroupModalVisible} onOk={addGroup} onCancel={hideModal} className="add-group-modal">
      <Row gutter={6} className="modal-input">
        <Col span={5}>
          <div className="label">分组名：</div>
        </Col>
        <Col span={15}>
          <Input placeholder="请输入分组名称" onChange={inputNewGroupName}/>
        </Col>
      </Row>
      <Row gutter={6} className="modal-input">
        <Col span={5}>
          <div className="label">简介：</div>
        </Col>
        <Col span={15}>
          <Input.TextArea rows={3} placeholder="请输入分组描述" onChange={inputNewGroupDesc}/>
        </Col>
      </Row>
      <Row gutter={6} className="modal-input">
        <Col span={5}>
          <div className="label">组长：</div>
        </Col>
        <Col span={15}>
          <UsernameAutoComplete callbackState={onUserSelect}/>
        </Col>
      </Row>
    </Modal>
  )
}
//
function GroupList(props) {
  //
  const { currGroup, groupList, fetchGroupList, study, studyTip } = props;
  const [groupId, setGroupId] = useState(0);
  //
  const [addGroupModalVisible, setAddGroupModalVisible] = useState(false);
  //
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [owner_uids, setOwner_uids] = useState([]);
  //
  const [currGroupName, setCurrGroupName] = useState("");
  const [currGroupDesc, setCurrGroupDesc] = useState("");
  //
  const navigate = useNavigate();
  const { groupId: paramsGroupId } = useParams();
  //
  const init = async() => {
    console.debug("UNSAFE_componentWillMount", props);
    console.debug("UNSAFE_componentWillMount", paramsGroupId);
    //
    if (paramsGroupId !== undefined) {
      setGroupId(() => !isNaN(paramsGroupId) ? parseInt(paramsGroupId) : 0);
    }
    //
    const req = await fetchGroupList();
    console.log("11111111111111111111111111111", req);
    //
    let currGroup = false;
    if (groupList.length && groupId) {
      for (let i = 0; i < groupList.length; i++) {
        if (groupList[i]._id === groupId) {
          currGroup = groupList[i];
        }
      }
    } else if (!groupId && groupList.length) {
      navigate(`/group/${groupList[0]._id}`);
    }
    if (!currGroup) {
      currGroup = groupList[0] || { group_name: "", group_desc: "" };
      navigate(`${currGroup._id}`, { replace: true });
    }
    setCurrGroup(currGroup);
  }
  //
  useEffect(() => {
    init();
    return () => {
      console.log("加载中");
    };
  }, []);

  //
  const showModal = () => {
    setAddGroupModalVisible(true);
  }
  //
  const hideModal = () => {
    setNewGroupName("")
    setAddGroupModalVisible(false);
  }
  //
  const addGroup = async() => {
    const res = await axios.post("/api/group/add", { group_name: newGroupName, group_desc: newGroupDesc, owner_uids });
    if (!res.data.errcode) {
      //
      hideModal();
      const currGroup = await fetchGroupList();
      fetchGroupMsg(currGroup._id);
      fetchNewsData(currGroup._id, "group", 1, 10);
    } else {
      message.error(res.data.errmsg);
    }
  }
  //
  const editGroup = async() => {
    const id = currGroup._id;
    const res = await axios.post("/api/group/up", { group_name: currGroupName, group_desc: currGroupDesc, id });
    if (res.data.errcode) {
      message.error(res.data.errmsg);
    } else {
      await fetchGroupList();
      const currGroup = _.find(groupList, (group) => +group._id === +id);
      setCurrGroup(currGroup);
      fetchGroupMsg(currGroup._id);
      fetchNewsData(currGroup._id, "group", 1, 10);
    }
  }
  //
  const inputNewGroupName = (e) => {
    setNewGroupName(e.target.value)
  }
  //
  const inputNewGroupDesc = (e) => {
    setNewGroupDesc(e.target.value)
  }
  //
  const selectGroup = (e) => {
    const groupId = e.key;
    // const currGroup = groupList.find((group) => { return +group._id === +groupId });
    const currGroup = _.find(groupList, (group) => +group._id === +groupId);
    setCurrGroup(currGroup);
    navigate(`${currGroup._id}`, { replace: true });
    fetchNewsData(groupId, "group", 1, 10);
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
    <Box sx={{height: "100%"}} className={styles.GroupList}>
      {!study ? <div className="study-mask"/> : null}
      <div className="group-bar">
        <div className="curr-group">
          <div className="curr-group-name">
            <span className="name">{currGroup.group_name}</span>
            <Tooltip title="添加分组">
              <a className="editSet" href="javascript:void(0);" onClick={showModal}>
                <ControlPointIcon/>
              </a>
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
        <Menu className="group-list" mode="inline" onClick={selectGroup} selectedKeys={[`${currGroup._id}`]}>
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
        </Menu>
      </div>
      {/*  */}
      <AddGroupModal {...{
        addGroupModalVisible,
        setAddGroupModalVisible,
        addGroup,
        editGroup,
        hideModal,
        setOwner_uids,
        inputNewGroupName,
        inputNewGroupDesc
      }}/>
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
