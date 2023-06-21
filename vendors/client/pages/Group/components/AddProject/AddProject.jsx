import React, { useState, useEffect, Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
//
import { Zoom, Select, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Box, FormControl, InputLabel } from "@mui/material";
//
import { Form, Input, Tooltip, message, Row, Col, Radio } from "antd";
import Icon from "@ant-design/icons";
//
import { addProject } from "@/reducer/modules/project.js";
import { fetchGroupList } from "@/reducer/modules/group.js";
import { autobind } from "core-decorators";
import { setBreadcrumb } from "@/reducer/modules/user.js";
//
import { pickRandomProperty, handlePath, nameLengthLimit } from "@/utils/common.js";
import constants from "@/utils/variable.js";

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
  name: yup.string().required("请输入姓名"),
  email: yup.string().email("请输入有效的电子邮件地址").required("请输入电子邮件地址"),
});
//
function AddProject(props) {
  const [open, setOpen] = useState(false);
  const { groupList, currGroup } = props;
  //
  const initialFormData = {
    "name": "", // 项目名称
    "group": "", // 所属分组
    "basepath": "", // 基本路径
    "desc": "", // 项目描述
    "project_type": "private" // private public 权限
  };
  const [formData, setFormData] = useState(initialFormData);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  //
  useEffect(() => {
    console.log("groupList: ", groupList, "currGroup: ", currGroup);
  }, []);
  //
  //
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  //
  const handleChange = (obj) => {
    setFormData((e) => ({ ...e, ...obj }))
  }
  //
  const handleSubmit = (event) => {
    event.preventDefault();
    // 验证表单字段
    schema.validate({ ...formData }, { abortEarly: false }).then(() => {
      // 在这里处理表单提交逻辑
      console.log(`提交表单：${formData}`);
    }).catch((err) => {
      // 显示错误消息
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
    });
  };
  //
  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        创建项目
      </Button>
      {/*  */}
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose}>
        <DialogTitle>创建项目</DialogTitle>
        {/*  */}
        <DialogContent>
          <Box sx={{ minWidth: 120, m: 1 }} component={"form"} onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <TextField label="项目名称" placeholder={"请输入项目名称"} value={formData.name} error={!!errors.name} helperText={errors.name}
                onChange={(event) => handleChange({ "name": event.target.value })}/>
            </FormControl>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <InputLabel id="group-simple-select-label">所属分组</InputLabel>
              <Select label="所属分组" placeholder={"请选择项目所属的分组"} labelId="group-simple-select-label" id="group-simple-select" value={formData.group}
                defaultValue={formData.group}
                onChange={(event) => handleChange({ "group": event.target.value })}>
                {
                  groupList.map((item, index) => (
                    <MenuItem key={index} value={item._id.toString()}
                      disabled={!(item.role === "dev" || item.role === "owner" || item.role === "admin")}>
                      {item.group_name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <TextField label="基本路径" placeholder={"请输入项目基本路径"} value={formData.basepath} error={!!errors.basepath} helperText={errors.basepath}
                onChange={(event) => handleChange({ "basepath": handlePath(event.target.value) })}/>
            </FormControl>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <TextField label="项目描述" placeholder={"项目描述不超过144字"} multiline rows={3} value={formData.desc} error={!!errors.desc} helperText={errors.desc}
                onChange={(event) => handleChange({ "desc": event.target.value })}/>
            </FormControl>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <TextField label="项目权限" placeholder={"请选择项目是否公开"} value={formData.project_type} error={!!errors.project_type} helperText={errors.project_type}
                onChange={(event) => handleChange({ "project_type": event.target.value })}/>
            </FormControl>
            <FormControl sx={{ mb: 2 }} fullWidth>
              <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button onClick={handleSubmit} type={"submit"} color="primary">创建</Button>
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
