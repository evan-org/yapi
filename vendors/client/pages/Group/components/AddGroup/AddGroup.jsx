import UsernameAutoComplete from "@/components/UsernameAutoComplete/UsernameAutoComplete.jsx";
import { fetchGroupList, fetchGroupMsg } from "@/reducer/modules/group.js";
import { fetchNewsData } from "@/reducer/modules/news.js";
import { pickRandomProperty } from "@/utils/common.js";
import constants from "@/utils/variable.js";
import { Zoom } from "@mui/material";
import { Col, Input, message, Modal, Row } from "antd";
import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
//
// 动画
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});
//
import * as yup from "yup";

const schema = yup.object().shape({
  group_name: yup.string().required("请输入分组名称"),
  group_desc: yup.string().required("请输入分组描述"),
  owner_uids: yup.array().max(1, "请选择分组所有者"),
});


//
function AddGroupModal(props) {
  const dispatch = useDispatch();
  //
  const formik = useFormik({
    initialValues: {
      "group_name": "", // 项目名称
      "group_desc": "", // 所属分组
      "owner_uids": "", // 基本路径
    },
    validationSchema: schema,
    onSubmit: async(values) => {
      try {
        // 在这里处理表单提交逻辑
        console.log(`提交表单：${JSON.stringify(values, null, 2)}`);
        const res = await addGroup(values);
        console.log("1111111111", res);
        if (res.payload.data.errcode === 0) {
          formik.resetForm();
          setMessage("创建成功");
          setOpenSnackbar(true);
          //
          navigate({pathname: "/project/" + res.payload.data.data._id + "/interface/api"});
        }
      } catch (e) {
        console.error(e);
      }
    },
  });
  //
  const addGroup = async(values) => {
    const res = await axios.post("/api/group/add", { ...values });
    if (!res.data.errcode) {
      //
      // hideModal();
      const currGroup = dispatch(fetchGroupList());
      fetchGroupMsg(currGroup._id);
      fetchNewsData(currGroup._id, "group", 1, 10);
    } else {
      message.error(res.data.errmsg);
    }
  }
  //
  const {
    addGroupModalVisible, inputNewGroupName, inputNewGroupDesc,
    hideModal, setOwner_uids
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

export default AddGroupModal;
