import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Icon, Layout, Menu, Dropdown, message, Tooltip, Popover, Tag } from "antd";
import { checkLoginState, logoutActions, loginTypeAction } from "../../../reducer/modules/user";
import { changeMenuItem } from "../../../reducer/modules/menu";
// import { withRouter } from "react-router";
import Search from "./Search/Search";
import Notify from "../../../components/Notify/Notify";
//
import styles from "./Header.module.scss";
//
import LogoSVG from "../../../components/LogoSVG/LogoSVG.jsx";
import Breadcrumb from "../../../components/Breadcrumb/Breadcrumb.jsx";
import GuideBtns from "../../../components/GuideBtns/GuideBtns.jsx";

const plugin = require("client/plugin.js");
let HeaderMenu = {
  user: {
    path: "/user/profile",
    name: "个人中心",
    icon: "user",
    adminFlag: false
  },
  solution: {
    path: "/user/list",
    name: "用户管理",
    icon: "solution",
    adminFlag: true
  }
};
plugin.emitHook("header_menu", HeaderMenu);
//
function MenuUser(props) {
  return (
    <Menu theme="dark" className="user-menu">
      {Object.keys(HeaderMenu).map((key) => {
        let item = HeaderMenu[key];
        const isAdmin = props.role === "admin";
        if (item.adminFlag && !isAdmin) {
          return null;
        }
        return (
          <Menu.Item key={key}>
            {item.name === "个人中心" ? (
              <Link to={item.path + `/${props.uid}`}>
                <Icon type={item.icon}/>
                {item.name}
              </Link>
            ) : (
              <Link to={item.path}>
                <Icon type={item.icon}/>
                {item.name}
              </Link>
            )}
          </Menu.Item>
        );
      })}
      <Menu.Item key="9">
        <a onClick={props.logout}>
          <Icon type="logout"/>退出
        </a>
      </Menu.Item>
    </Menu>
  )
}
MenuUser.propTypes = {
  user: PropTypes.string,
  msg: PropTypes.string,
  role: PropTypes.string,
  uid: PropTypes.number,
  relieveLink: PropTypes.func,
  logout: PropTypes.func
};
//
function TipFollow() {
  return <div className="title-container">
    <h3 className="title">
      <Icon type="star"/> 关注
    </h3>
    <p>这里是你的专属收藏夹，便于你找到自己的项目</p>
  </div>
}
function TipAdd() {
  return <div className="title-container">
    <h3 className="title">
      <Icon type="plus-circle"/> 新建项目
    </h3>
    <p>在任何页面都可以快速新建项目</p>
  </div>
}
function TipDoc() {
  return <div className="title-container">
    <h3 className="title">
      使用文档 <Tag color="orange">推荐!</Tag>
    </h3>
    <p>
      初次使用 YApi，强烈建议你阅读{" "}
      <a target="_blank" href="https://hellosean1025.github.io/yapi/" rel="noopener noreferrer">
        使用文档
      </a>
      ，我们为你提供了通俗易懂的快速入门教程，更有详细的使用说明，欢迎阅读！{" "}
    </p>
  </div>
}
function ToolUser(props) {
  let imageUrl = props.imageUrl ? props.imageUrl : `/api/user/avatar?uid=${props.uid}`;
  return (
    <ul>
      <li className="toolbar-li item-search">
        <Search groupList={props.groupList}/>
      </li>
      <Popover
        overlayClassName="popover-index"
        content={<GuideBtns/>}
        title={<TipFollow/>}
        placement="bottomRight"
        arrowPointAtCenter
        visible={props.studyTip === 1 && !props.study}
      >
        <Tooltip placement="bottom" title={"我的关注"}>
          <li className="toolbar-li">
            <Link to="/follow">
              <Icon className="dropdown-link" style={{ fontSize: 16 }} type="star"/>
            </Link>
          </li>
        </Tooltip>
      </Popover>
      <Popover
        overlayClassName="popover-index"
        content={<GuideBtns/>}
        title={<TipAdd/>}
        placement="bottomRight"
        arrowPointAtCenter
        visible={props.studyTip === 2 && !props.study}
      >
        <Tooltip placement="bottom" title={"新建项目"}>
          <li className="toolbar-li">
            <Link to="/add-project">
              <Icon className="dropdown-link" style={{ fontSize: 16 }} type="plus-circle"/>
            </Link>
          </li>
        </Tooltip>
      </Popover>
      <Popover
        overlayClassName="popover-index"
        content={<GuideBtns isLast/>}
        title={<TipDoc/>}
        placement="bottomRight"
        arrowPointAtCenter
        visible={props.studyTip === 3 && !props.study}
      >
        <Tooltip placement="bottom" title={"使用文档"}>
          <li className="toolbar-li">
            <a target="_blank" href="https://hellosean1025.github.io/yapi" rel="noopener noreferrer">
              <Icon className="dropdown-link" style={{ fontSize: 16 }} type="question-circle"/>
            </a>
          </li>
        </Tooltip>
      </Popover>
      <li className="toolbar-li">
        <Dropdown
          placement="bottomRight"
          trigger={["click"]}
          overlay={
            <MenuUser
              user={props.user}
              msg={props.msg}
              uid={props.uid}
              role={props.role}
              relieveLink={props.relieveLink}
              logout={props.logout}
            />
          }
        >
          <a className="dropdown-link">
            <span className="avatar-image">
              <img src={imageUrl}/>
            </span>
            {/* props.imageUrl? <Avatar src={props.imageUrl} />: <Avatar src={`/api/user/avatar?uid=${props.uid}`} />*/}
            <span className="name">
              <Icon type="down"/>
            </span>
          </a>
        </Dropdown>
      </li>
    </ul>
  );
}
ToolUser.propTypes = {
  user: PropTypes.string,
  msg: PropTypes.string,
  role: PropTypes.string,
  uid: PropTypes.number,
  relieveLink: PropTypes.func,
  logout: PropTypes.func,
  groupList: PropTypes.array,
  studyTip: PropTypes.number,
  study: PropTypes.bool,
  imageUrl: PropTypes.any
};
//
function HeaderBox(props) {
  const {curUserRole, studyTip, login, study, user, msg, uid, role, imageUrl } = props;
  const linkTo = (e) => {
    if (e.key !== "/doc") {
      props.changeMenuItem(e.key);
      if (!props.login) {
        message.info("请先登录", 1);
      }
    }
  };
  const relieveLink = () => {
    props.changeMenuItem("");
  };
  const logout = (e) => {
    e.preventDefault();
    props.logoutActions().then((res) => {
      if (res.payload.data.errcode === 0) {
        props.history.push("/");
        props.changeMenuItem("/");
        message.success("退出成功! ");
      } else {
        message.error(res.payload.data.errmsg);
      }
    }).catch((err) => {
      message.error(err);
    });
  };
  const handleLogin = (e) => {
    e.preventDefault();
    props.loginTypeAction("1");
  };
  const handleReg = (e) => {
    e.preventDefault();
    props.loginTypeAction("2");
  };
  const checkLoginState = () => {
    props.checkLoginState.then((res) => {
      if (res.payload.data.errcode !== 0) {
        props.history.push("/");
      }
    }).catch((err) => {
      console.log(err);
    });
  };
  return (
    <header>
      {curUserRole === "admin" && <Notify/>}
      <Layout.Header className={styles.HeaderBox}>
        <div className="content g-row">
          <Link onClick={relieveLink} to="/group" className="logo">
            <div className="href">
              <span className="img">
                <LogoSVG length="32px"/>
              </span>
            </div>
          </Link>
          <Breadcrumb/>
          <div className="user-toolbar" style={{ position: "relative", zIndex: studyTip > 0 ? 3 : 1 }}>
            {login ? <ToolUser{...props} relieveLink={relieveLink} logout={logout}/> : null}
          </div>
        </div>
      </Layout.Header>
    </header>
  )
}
export default connect(
  (state) => ({
    user: state.user.userName,
    uid: state.user.uid,
    msg: null,
    role: state.user.role,
    login: state.user.isLogin,
    studyTip: state.user.studyTip,
    study: state.user.study,
    imageUrl: state.user.imageUrl
  }),
  {
    loginTypeAction,
    logoutActions,
    checkLoginState,
    changeMenuItem
  }
)(HeaderBox);
