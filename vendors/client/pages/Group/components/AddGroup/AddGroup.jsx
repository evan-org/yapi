import UsernameAutoComplete from "@/components/UsernameAutoComplete/UsernameAutoComplete.jsx";
import { fetchGroupList, fetchGroupMsg } from "@/reducer/modules/group.js";
import { fetchNewsData } from "@/reducer/modules/news.js";
import { pickRandomProperty } from "@/utils/common.js";
import constants from "@/utils/variable.js";
import { Snackbar } from "@mui/base";
import { Close } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Zoom } from "@mui/material";
import { Col, Input, Modal, Row } from "antd";
import axios from "axios";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  //
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState(false);
  //
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
          navigate({ pathname: "/project/" + res.payload.data.data._id + "/interface/api" });
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
      const action = await fetchGroupList()
      const currGroup = dispatch(action);
      await fetchGroupMsg(currGroup._id);
      await fetchNewsData(currGroup._id, "group", 1, 10);
    } else {
      message.error(res.data.errmsg);
    }
  }
  const onUserSelect = (uids) => setOwner_uids(uids);
  //
  const handleClickOpen = async() => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  //
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  //
  const action = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
        <Close fontSize="small"/>
      </IconButton>
    </React.Fragment>
  );
  //
  return (
    <>
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
      {/*  */}
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        创建项目
      </Button>
      {/*  */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose} message={message} action={action}/>
      {/*  */}
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose}>
        <DialogTitle>创建项目</DialogTitle>
        {/*  */}
        <DialogContent>
          <Box sx={{ minWidth: 120, m: 1 }} component={"form"}>
            <TextField sx={{ mb: 2 }} fullWidth label="分组名称" placeholder={"请输入分组名称"} name={"name"} value={formik.values.group_name}
                       error={Boolean(formik.touched.group_name && formik.errors.group_name)}
                       helperText={formik.touched.group_name && formik.errors.group_name}
                       onChange={formik.handleChange}/>

            <TextField sx={{ mb: 2 }} fullWidth label="分组描述" placeholder={"分组描述不超过144字"} name={"desc"} multiline rows={3} value={formik.values.group_desc}
                       error={Boolean(formik.touched.group_desc && formik.errors.group_desc)}
                       helperText={formik.touched.group_desc && formik.errors.group_desc}
                       onChange={formik.handleChange}
                       onBlur={formik.handleBlur}/>

            <FormControl sx={{ mb: 2 }} fullWidth error={Boolean(formik.touched.owner_uids && formik.errors.owner_uids)}>
              <InputLabel>分组所属人员</InputLabel>
              <Select label="分组所属人员" placeholder={"请选择项目分组所属人员"}
                      name={"group"} value={formik.values.owner_uids} defaultValue={formik.values.owner_uids}
                      onChange={formik.handleChange}>
                {
                  groupList.map((item, index) => (
                    <MenuItem key={index} value={item._id.toString()}
                              disabled={!(item.role === "dev" || item.role === "owner" || item.role === "admin")}>
                      {item.group_name}
                    </MenuItem>
                  ))
                }
              </Select>
              {formik.touched.owner_uids && formik.errors.owner_uids && (
                <Box sx={{ color: "red", fontSize: 12 }}>{formik.errors.owner_uids}</Box>
              )}
            </FormControl>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button onClick={formik.handleSubmit} type={"submit"} color="primary">创建</Button>
              </DialogActions>
            </FormControl>
          </Box>
        </DialogContent>
        {/*  */}
      </Dialog>
    </>)
}
export default AddGroupModal;
