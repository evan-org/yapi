import React, { createContext, PureComponent as Component, useContext, useEffect } from "react";
import { Prop } from "react-dom";
import { Row, Col, Input, Button, Select, message, Upload, Tooltip } from "antd";
import axios from "axios";
import { formatTime } from "@/utils/common";
import PropTypes from "prop-types";
import { setBreadcrumb, setImageUrl } from "@/reducer/modules/user";
import { connect } from "react-redux";
import { matchPath, useParams } from "react-router-dom";

const EditButton = (props) => {
  const { isAdmin, isOwner, onClick, name, admin } = props;
  if (isOwner) {
    // 本人
    if (admin) {
      return null;
    }
    return (
      <Button
        icon="edit"
        onClick={() => {
          onClick(name, true);
        }}
      >
        修改
      </Button>
    );
  } else if (isAdmin) {
    // 管理员
    return (
      <Button
        icon="edit"
        onClick={() => {
          onClick(name, true);
        }}
      >
        修改
      </Button>
    );
  } else {
    return null;
  }
};
EditButton.propTypes = {
  isAdmin: PropTypes.bool,
  isOwner: PropTypes.bool,
  onClick: PropTypes.func,
  name: PropTypes.string,
  admin: PropTypes.bool
};

@connect(
  (state) => ({
    url: state.user.imageUrl
  }),
  {
    setImageUrl
  }
)
class AvatarUpload extends Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    uid: PropTypes.number,
    setImageUrl: PropTypes.func,
    url: PropTypes.any
  };
  uploadAvatar(basecode) {
    axios
      .post("/api/user/upload_avatar", { basecode: basecode })
      .then(() => {
      // this.setState({ imageUrl: basecode });
        this.props.setImageUrl(basecode);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  handleChange(info) {
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (basecode) => {
        this.uploadAvatar(basecode);
      });
    }
  }
  render() {
    const { url } = this.props;
    let imageUrl = url ? url : `/api/user/avatar?uid=${this.props.uid}`;
    // let imageUrl = this.state.imageUrl ? this.state.imageUrl : `/api/user/avatar?uid=${this.props.uid}`;
    // console.log(this.props.uid);
    return (
      <div className="avatar-box">
        <Tooltip
          placement="right"
          title={<div>点击头像更换 (只支持jpg、png格式且大小不超过200kb的图片)</div>}
        >
          <div>
            <Upload
              className="avatar-uploader"
              name="basecode"
              showUploadList={false}
              action="/api/user/upload_avatar"
              beforeUpload={beforeUpload}
              onChange={this.handleChange.bind(this)}
            >
              {/* <Avatar size="large" src={imageUrl}  />*/}
              <div style={{ width: 100, height: 100 }}>
                <img className="avatar" src={imageUrl}/>
              </div>
            </Upload>
          </div>
        </Tooltip>
        <span className="avatarChange"/>
      </div>
    );
  }
}

function beforeUpload(file) {
  const isJPG = file.type === "image/jpeg";
  const isPNG = file.type === "image/png";
  if (!isJPG && !isPNG) {
    message.error("图片的格式只能为 jpg、png！");
  }
  const isLt2M = file.size / 1024 / 1024 < 0.2;
  if (!isLt2M) {
    message.error("图片必须小于 200kb!");
  }

  return (isPNG || isJPG) && isLt2M;
}

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

const PropsContext = createContext(null);
//
function UserNameEdit({ usernameEdit, userType, userinfo }) {
  // 用户名信息修改
  if (usernameEdit === false) {
    return (<div>
      <span className="text">{userinfo.username}</span>&nbsp;&nbsp;
      {/* <span className="text-button"  onClick={() => { this.handleEdit('usernameEdit', true) }}><Icon type="edit" />修改</span>*/}
      {/* {btn} */}
      {/* 站点登陆才能编辑 */}
      {userType && (
        <EditButton
          userType={userType}
          isOwner={userinfo.uid === this.props.curUid}
          isAdmin={this.props.curRole === "admin"}
          onClick={this.handleEdit}
          name="usernameEdit"
        />
      )}
    </div>);
  } else {
    return (
      <div>
        <Input value={_userinfo.username} name="username" onChange={this.changeUserinfo}
          placeholder="用户名"/>
        <Button.Group className="edit-buttons">
          <Button className="edit-button" onClick={() => {
            this.handleEdit("usernameEdit", false);
          }}
          >
            取消
          </Button>
          <Button
            className="edit-button"
            onClick={() => {
              this.updateUserinfo("username");
            }}
            type="primary"
          >
            确定
          </Button>
        </Button.Group>
      </div>
    );
  }
}

// 邮箱信息修改
function EmailEdit({ emailEdit }) {
  if (emailEdit === false) {
    return (
      <div>
        <span className="text">{userinfo.email}</span>&nbsp;&nbsp;
        {/* <span className="text-button" onClick={() => { this.handleEdit('emailEdit', true) }} ><Icon type="edit" />修改</span>*/}
        {/* {btn} */}
        {/* 站点登陆才能编辑 */}
        {userType && (
          <EditButton
            admin={userinfo.role === "admin"}
            isOwner={userinfo.uid === this.props.curUid}
            isAdmin={this.props.curRole === "admin"}
            onClick={this.handleEdit}
            name="emailEdit"
          />
        )}
      </div>
    );
  } else {
    return (
      <div>
        <Input
          placeholder="Email"
          value={_userinfo.email}
          name="email"
          onChange={this.changeUserinfo}
        />
        <ButtonGroup className="edit-buttons">
          <Button
            className="edit-button"
            onClick={() => {
              this.handleEdit("emailEdit", false);
            }}
          >
            取消
          </Button>
          <Button
            className="edit-button"
            type="primary"
            onClick={() => {
              this.updateUserinfo("email");
            }}
          >
            确定
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

// 角色
function RoleEdit({ roleEdit }) {
  if (roleEdit) {
    return (
      <div>
        <span className="text">{roles[userinfo.role]}</span>&nbsp;&nbsp;
      </div>
    );
  } else {
    return (
      <Select defaultValue={_userinfo.role} onChange={this.changeRole} style={{ width: 150 }}>
        <Option value="admin">管理员</Option>
        <Option value="member">会员</Option>
      </Select>
    );
  }
}

function SecureEdit() {
  const { secureEdit, userType, handleEdit, curRole, userinfo } = useContext(PropsContext);
  if (secureEdit === false) {
    if (userType) {
      return (
        <Button icon="edit" onClick={() => {
          handleEdit("secureEdit", true)
        }}>修改
        </Button>
      );
    }
    return null
  } else {
    return (
      <div>
        <Input
          style={{ display: curRole === "admin" && userinfo.role !== "admin" ? "none" : "" }}
          placeholder="旧的密码"
          type="password"
          name="old_password"
          id="old_password"
        />
        <Input placeholder="新的密码" type="password" name="password" id="password"/>
        <Input placeholder="确认密码" type="password" name="verify_pass" id="verify_pass"/>
        <ButtonGroup className="edit-buttons">
          <Button className="edit-button" onClick={() => {
            handleEdit("secureEdit", false);
          }}>
            取消
          </Button>
          <Button className="edit-button" onClick={updatePassword} type="primary">
            确定
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}
//
function Profile(props) {
  /*
  usernameEdit: false,
      emailEdit: false,
      secureEdit: false,
      roleEdit: false,
      userinfo: {}
  *  */
  const { curUid, userType, curRole, setBreadcrumb } = props;
  const [userinfo, setUserinfo] = useState({});
  const [defineUserInfo, setDefineUserInfo] = useState({});
  const [usernameEdit, setUsernameEdit] = useState(false);
  const [emailEdit, setEmailEdit] = useState(false);
  const [roleEdit, setRoleEdit] = useState(false);
  const [secureEdit, setSecureEdit] = useState(false);
  const { uid } = useParams();
  //
  useEffect(() => {
    getUserInfo(uid);
  }, []);

  const handleEdit = (key, val) => {
    let s = {};
    s[key] = val;
    this.setState(s);
  };

  const getUserInfo = async(id) => {
    try {
      const res = await axios.get("/api/user/find?id=" + id);
      setUserinfo(() => res?.data?.data ?? {});
      setDefineUserInfo(res.data.data);
      if (curUid === +id) {
        setBreadcrumb([{ name: res.data.data.username }]);
      } else {
        setBreadcrumb([{ name: "管理: " + res.data.data.username }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserinfo = async(name) => {
    try {
      let value = defineUserInfo[name];
      let params = { uid: userinfo.uid };
      params[name] = value;
      const res = await axios.post("/api/user/update", params);
      let data = res.data;
      if (data.errcode === 0) {
        const _userinfo = userinfo;
        _userinfo[name] = value;
        setUserinfo(_userinfo);
        handleEdit(name + "Edit", false);
        message.success("更新用户信息成功");
      } else {
        message.error(data.errmsg);
      }
    } catch (err) {
      message.error(err?.message);
    }
  };

  const changeUserinfo = (e) => {
    let dom = e.target;
    let name = dom.getAttribute("name");
    let value = dom.value;
    setDefineUserInfo(() => ({
      ...defineUserInfo,
      [name]: value
    }));
  };

  const changeRole = (val) => {
    let _userinfo = userinfo;
    _userinfo.role = val;
    setUserinfo(_userinfo);
    updateUserinfo("role");
  };

  const updatePassword = async() => {
    let old_password = document.getElementById("old_password").value;
    let password = document.getElementById("password").value;
    let verify_pass = document.getElementById("verify_pass").value;
    if (password !== verify_pass) {
      return message.error("两次输入的密码不一样");
    }
    let params = {
      uid: userinfo.uid,
      password: password,
      old_password: old_password
    };
    try {
      const res = await axios.post("/api/user/change_password", params);
      const data = res.data;
      if (data.errcode === 0) {
        handleEdit("secureEdit", false);
        message.success("修改密码成功");
        if (curUid === userinfo.uid) {
          location.reload();
        }
      } else {
        message.error(data.errmsg);
      }
    } catch (err) {
      message.error(err.message);
    }
  };
  //
  return (
    <PropsContext.Provider value={{ userinfo, usernameEdit, emailEdit, roleEdit, secureEdit }}>
      <div className="user-profile">
        <div className="user-item-body">
          {userinfo.uid === curUid ? (
            <h3>个人设置</h3>
          ) : (
            <h3>{userinfo.username} 资料设置</h3>
          )}
          <Row className="avatarCon" type="flex" justify="start">
            <Col span={24}>
              {userinfo.uid === curUid ? (
                <AvatarUpload uid={userinfo.uid}>点击上传头像</AvatarUpload>
              ) : (
                <div className="avatarImg">
                  <img src={`/api/user/avatar?uid=${userinfo.uid}`} alt=""/>
                </div>
              )}
            </Col>
          </Row>
          <Row className="user-item" type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>用户id</Col>
            <Col span={12}>{userinfo.uid}</Col>
          </Row>
          <Row className="user-item" type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>用户名</Col>
            <Col span={12}><UserNameEdit/></Col>
          </Row>
          <Row className="user-item" type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>Email</Col>
            <Col span={12}><EmailEdit/></Col>
          </Row>
          <Row className="user-item" style={{ display: this.props.curRole === "admin" ? "" : "none" }} type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>角色</Col>
            <Col span={12}><RoleEdit/></Col>
          </Row>
          <Row className="user-item" style={{ display: this.props.curRole === "admin" ? "" : "none" }} type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>登陆方式</Col>
            <Col span={12}>{userinfo.type === "site" ? "站点登陆" : "第三方登陆"}</Col>
          </Row>
          <Row className="user-item" type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>创建账号时间</Col>
            <Col span={12}>{formatTime(userinfo.add_time)}</Col>
          </Row>
          <Row className="user-item" type="flex" justify="start">
            <div className="maoboli"/>
            <Col span={4}>更新账号时间</Col>
            <Col span={12}>{formatTime(userinfo.up_time)}</Col>
          </Row>
          {userType ? (
            <Row className="user-item" type="flex" justify="start">
              <div className="maoboli"/>
              <Col span={4}>密码</Col>
              <Col span={12}><SecureEdit/></Col>
            </Row>
          ) : (
            ""
          )}
        </div>
      </div>
    </PropsContext.Provider>
  )
}
export default connect(
  (state) => ({
    curUid: state.user.uid,
    userType: state.user.type,
    curRole: state.user.role
  }),
  {
    setBreadcrumb
  }
)(Profile);
