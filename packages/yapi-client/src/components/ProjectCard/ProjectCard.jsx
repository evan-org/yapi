import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
//
import { Card, Tooltip, Modal, Alert, Input, message } from "antd";
import Icon from "@ant-design/icons";
import constants from "@/utils/variable.js";
import produce from "immer";
//
import { debounce, trim } from "@/utils/common.js";
import { getProject, checkProjectName, copyProjectMsg } from "@/reducer/modules/project.js";
import { delFollow, addFollow } from "@/reducer/modules/follow.js";
//
import styles from "./ProjectCard.module.scss";
//
function ProjectCard(props) {
  const { projectData, inFollowPage, isShow, callbackResult, getProject, copyProjectMsg } = props;
  //
  const navigate = useNavigate();
  //
  const copy = async(projectName) => {
    const id = projectData._id;
    let newProjectData = await getProject(id);
    let data = newProjectData.payload.data.data;
    let newData = produce(data, (draftData) => {
      draftData.preName = draftData.name;
      draftData.name = projectName;
    });
    await copyProjectMsg(newData);
    message.success("项目复制成功");
    callbackResult();
  };
  // 复制项目的二次确认
  const showConfirm = () => {
    Modal.confirm({
      title: "确认复制 " + projectData.name + " 项目吗？",
      okText: "确认",
      cancelText: "取消",
      content: (
        <div style={{ marginTop: "10px", fontSize: "13px", lineHeight: "25px" }}>
          <Alert message={`该操作将会复制 ${projectData.name} 下的所有接口集合，但不包括测试集合中的接口`} type="info"/>
          <div style={{ marginTop: "16px" }}>
            <p>
              <b>项目名称:</b>
            </p>
            <Input id="project_name" placeholder="项目名称"/>
          </div>
        </div>
      ),
      async onOk() {
        const projectName = trim(document.getElementById("project_name").value);
        // 查询项目名称是否重复
        const group_id = projectData.group_id;
        await checkProjectName(projectName, group_id);
        await copy(projectName);
      },
      iconType: "copy",
      onCancel() {
      }
    });
  };
  const del = () => {
    const id = projectData.projectid || projectData._id;
    delFollow(id).then((res) => {
      if (res.payload.data.errcode === 0) {
        callbackResult();
        // message.success('已取消关注！');  // 星号已做出反馈 无需重复提醒用户
      }
    });
  };
  const add = () => {
    const { uid, projectData, addFollow } = props;
    const param = {
      uid: uid,
      projectid: projectData._id,
      projectname: projectData.name,
      icon: projectData.icon || constants.PROJECT_ICON[0],
      color: projectData.color || constants.PROJECT_COLOR.blue
    };
    addFollow(param).then((res) => {
      if (res.payload.data.errcode === 0) {
        callbackResult();
        // message.success('已添加关注！');  // 星号已做出反馈 无需重复提醒用户
      }
    });
  };
  //
  return (
    <div className={styles.ProjectCardContainer}>
      <Card bordered={false} className="m-card"
        onClick={() => navigate({ pathname: "/project/" + (projectData.projectid || projectData._id) })}>
        <Icon type={projectData.icon || "star-o"} className="ui-logo"
          style={{
            backgroundColor: constants.PROJECT_COLOR[projectData.color] || constants.PROJECT_COLOR.blue
          }}/>
        <h4 className="ui-title">{projectData.name || projectData.projectname}</h4>
      </Card>
      <div className="card-btns" onClick={projectData.follow || inFollowPage ? debounce(del, 400) : debounce(add, 400)}>
        <Tooltip placement="rightTop" title={projectData.follow || inFollowPage ? "取消关注" : "添加关注"}>
          <Icon type={projectData.follow || inFollowPage ? "star" : "star-o"}
            className={"icon " + (projectData.follow || inFollowPage ? "active" : "")}/>
        </Tooltip>
      </div>
      {isShow && (
        <div className="copy-btns" onClick={showConfirm}>
          <Tooltip placement="rightTop" title="复制项目">
            <Icon type="copy" className="icon"/>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
export default connect(
  (state) => ({
    uid: state.user.uid,
    currPage: state.project.currPage
  }),
  {
    delFollow,
    addFollow,
    getProject,
    checkProjectName,
    copyProjectMsg
  }
)(ProjectCard);
