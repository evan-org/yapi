import { Snackbar } from "@mui/base";
import { Close } from "@mui/icons-material";
import { useFormik } from "formik";
import React, { useState, useEffect, Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
//
import {
  Zoom, Select, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Box, FormControl, InputLabel,
  RadioGroup, Radio, FormControlLabel, FormLabel, IconButton
} from "@mui/material";
//
import { Form, Input, Tooltip, message, Row, Col, Alert } from "antd";
import Icon from "@ant-design/icons";
//
import { addProject } from "@/reducer/modules/project.js";
import { fetchGroupList } from "@/reducer/modules/group.js";
import { autobind } from "core-decorators";
import { setBreadcrumb } from "@/reducer/modules/user.js";
//
import { pickRandomProperty, handlePath, nameLengthLimit, debounce } from "@/utils/common.js";
import constants from "@/utils/variable.js";
import { useNavigate } from "react-router-dom";

const formItemLayout = {
  labelCol: {
    lg: { span: 3 },
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    lg: { span: 21 },
    xs: { span: 24 },
    sm: { span: 14 }
  },
  className: "form-item"
};
class ProjectList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupList: [],
      currGroupId: null
    };
  }
  static propTypes = {
    groupList: PropTypes.array,
    form: PropTypes.object,
    currGroup: PropTypes.object,
    addProject: PropTypes.func,
    history: PropTypes.object,
    setBreadcrumb: PropTypes.func,
    fetchGroupList: PropTypes.func
  };
  handlePath = (e) => {
    let val = e.target.value;
    this.props.form.setFieldsValue({
      basepath: handlePath(val)
    });
  };
  // 确认添加项目
  @autobind
  handleOk(e) {
    const { form, addProject } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        values.group_id = values.group;
        values.icon = constants.PROJECT_ICON[0];
        values.color = pickRandomProperty(constants.PROJECT_COLOR);
        addProject(values).then((res) => {
          if (res.payload.data.errcode === 0) {
            form.resetFields();
            message.success("创建成功! ");
            this.props.history.push("/project/" + res.payload.data.data._id + "/interface/api");
          }
        });
      }
    });
  }
  async UNSAFE_componentWillMount() {
    this.props.setBreadcrumb([{ name: "新建项目" }]);
    if (!this.props.currGroup._id) {
      await this.props.fetchGroupList();
    }
    if (this.props.groupList.length === 0) {
      return null;
    }
    this.setState({
      currGroupId: this.props.currGroup._id ? this.props.currGroup._id : this.props.groupList[0]._id
    });
    this.setState({ groupList: this.props.groupList });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="g-row">
        <div className="g-row m-container">
          <Form>
            <Form.Item {...formItemLayout} label="项目名称">
              {getFieldDecorator("name", {
                rules: nameLengthLimit("项目")
              })(<Input/>)}
            </Form.Item>
            <Form.Item {...formItemLayout} label="所属分组">
              {getFieldDecorator("group", {
                initialValue: this.state.currGroupId + "",
                rules: [
                  {
                    required: true,
                    message: "请选择项目所属的分组!"
                  }
                ]
              })(
                <Select>
                  {this.state.groupList.map((item, index) => (
                    <Select.Option
                      disabled={
                        !(item.role === "dev" || item.role === "owner" || item.role === "admin")
                      }
                      value={item._id.toString()}
                      key={index}
                    >
                      {item.group_name}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <hr className="breakline"/>
            <Form.Item
              {...formItemLayout}
              label={
                <span>
                  基本路径&nbsp;
                  <Tooltip title="接口基本路径，为空是根路径">
                    <Icon type="question-circle-o"/>
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator("basepath", {
                rules: [
                  {
                    required: false,
                    message: "请输入项目基本路径"
                  }
                ]
              })(<Input onBlur={this.handlePath}/>)}
            </Form.Item>
            <Form.Item {...formItemLayout} label="描述">
              {getFieldDecorator("desc", {
                rules: [
                  {
                    required: false,
                    message: "描述不超过144字!",
                    max: 144
                  }
                ]
              })(<Input.TextArea rows={4}/>)}
            </Form.Item>
            <Form.Item {...formItemLayout} label="权限">
              {getFieldDecorator("project_type", {
                rules: [
                  {
                    required: true
                  }
                ],
                initialValue: "private"
              })(
                <Radio.Group>
                  <Radio value="private" className="radio">
                    <Icon type="lock"/>私有<br/>
                    <span className="radio-desc">只有组长和项目开发者可以索引并查看项目信息</span>
                  </Radio>
                  <br/>
                  {/* <Radio value="public" className="radio">
                    <Icon type="unlock" />公开<br />
                    <span className="radio-desc">任何人都可以索引并查看项目信息</span>
                  </Radio> */}
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
          <Row>
            <Col sm={{ offset: 6 }} lg={{ offset: 3 }}>
              <Button className="m-btn" icon="plus" type="primary" onClick={this.handleOk}>
                创建项目
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
// 动画
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});
//
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("请输入项目名称"),
  group: yup.string().required("请选择所属分组"),
  basepath: yup.string().required("请输入基本路径"),
  desc: yup.string().max(144, "项目描述不超过144字"),
  project_type: yup.string()
});
//
function AddProject(props) {
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false);
  //
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState(false);
  //
  const [currGroupId, setCurrGroupId] = useState(false);
  const { groupList, currGroup, addProject } = props;
  const formik = useFormik({
    initialValues: {
      "name": "", // 项目名称
      "group": "", // 所属分组
      "basepath": "/", // 基本路径
      "desc": "", // 项目描述
      "project_type": "private" // private public 权限
    },
    validationSchema: schema,
    onSubmit: async(values) => {
      try {
        // 在这里处理表单提交逻辑
        console.log(`提交表单：${JSON.stringify(values, null, 2)}`);
        values.group_id = values.group;
        values.icon = constants.PROJECT_ICON[0];
        values.color = pickRandomProperty(constants.PROJECT_COLOR);
        console.debug("在这里处理表单提交逻辑 参数", values);
        const res = await addProject(values);
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
  useEffect(() => {
    console.log("groupList: ", groupList, "currGroup: ", currGroup);
  }, []);
  //
  //
  const handleClickOpen = async() => {
    setOpen(true);
    //
    props.setBreadcrumb([{ name: "新建项目" }]);
    if (!props.currGroup._id) {
      await props.fetchGroupList();
    }
    if (props.groupList.length === 0) {
      return null;
    }
    setCurrGroupId(() => props.currGroup._id ? props.currGroup._id : props.groupList[0]._id)
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
            <TextField sx={{ mb: 2 }} fullWidth label="项目名称" placeholder={"请输入项目名称"} name={"name"} value={formik.values.name}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              onChange={formik.handleChange}/>
            <FormControl sx={{ mb: 2 }} fullWidth error={Boolean(formik.touched.group && formik.errors.group)}>
              <InputLabel>所属分组</InputLabel>
              <Select label="所属分组" placeholder={"请选择项目所属的分组"}
                name={"group"} value={formik.values.group} defaultValue={formik.values.group}
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
              {formik.touched.group && formik.errors.group && (
                <Box sx={{ color: "red", fontSize: 12 }}>{formik.errors.group}</Box>
              )}
            </FormControl>
            <TextField sx={{ mb: 2 }} fullWidth label="基本路径" placeholder={"请输入项目基本路径"} name={"basepath"} value={formik.values.basepath}
              error={Boolean(formik.touched.basepath && formik.errors.basepath)}
              helperText={formik.touched.basepath && formik.errors.basepath}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}/>
            <TextField sx={{ mb: 2 }} fullWidth label="项目描述" placeholder={"项目描述不超过144字"} name={"desc"} multiline rows={3} value={formik.values.desc}
              error={Boolean(formik.touched.desc && formik.errors.desc)}
              helperText={formik.touched.desc && formik.errors.desc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}/>
            <FormControl component="fieldset" sx={{ mb: 2 }} fullWidth>
              <FormLabel component="legend">项目权限</FormLabel>
              <RadioGroup label="项目权限" placeholder={"请选择项目是否公开"} value={formik.values.project_type}
                defaultValue={formik.values.project_type} row
                name="project_type"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}>
                <FormControlLabel value="public" control={<Radio/>} label="公开"/>
                <FormControlLabel value="private" control={<Radio/>} label="私有化"/>
              </RadioGroup>
              <Box sx={{ fontSize: 12 }}>
                Tips: {formik.values.project_type === "private" ? "只有组长和项目开发者可以索引并查看项目信息" : "任何人都可以索引并查看项目信息"}
              </Box>
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
    </>
  )
}
export default connect(
  (state) => ({
    groupList: state.group.groupList,
    currGroup: state.group.currGroup
  }),
  {
    fetchGroupList,
    addProject,
    setBreadcrumb
  }
)(AddProject);
