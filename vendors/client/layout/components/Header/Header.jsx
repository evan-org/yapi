import typography from "@/views/utilities/Typography.js";
import { Box, AppBar, IconButton, Menu, MenuItem, Toolbar, Typography, InputBase, Badge } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import { replace } from "formik";
//
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dropdown, message, Tooltip, Popover, Tag } from "antd";
import Icon from "@ant-design/icons";
import { checkLoginState, logoutActions, loginTypeAction } from "@/reducer/modules/user.js";
import { changeMenuItem } from "@/reducer/modules/menu.js";
import Search from "./Search/Search";
// import Notify from "../../../components/Notify/Notify";
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
  const { curUserRole, studyTip, login, study, user, msg, uid, role, imageUrl } = props;
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
    <header className={styles.Header}>
      {/* {curUserRole === "admin" && <Notify/>}*/}
      <div className={styles.HeaderBox}>
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
      </div>
    </header>
  )
}
//
const SearchStyled = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));
//
function PrimarySearchAppBar(props) {
  const location = useLocation();
  const navigate = useNavigate();
  //
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const onLogout = async() => {
    try {
      const res = await props.logoutActions();
      if (res.payload.data.errcode === 0) {
        navigate({ pathname: "/" }, { replace: true });
        props.changeMenuItem("/");
        message.success("退出成功! ");
      } else {
        message.error(res.payload.data.errmsg);
      }
    } catch (err) {
      message.error(err);
    }
  };
  //
  useEffect(() => {
    handleMenuClose();
  }, [location])
  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  //
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu anchorEl={anchorEl} id={menuId} keepMounted
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={isMenuOpen} onClose={handleMenuClose}>
      {Object.keys(HeaderMenu).map((key) => {
        let item = HeaderMenu[key];
        const isAdmin = props.role === "admin";
        if (item.adminFlag && !isAdmin) {
          return null;
        }
        return (
          <Link key={key} to={item.path + (item.name === "个人中心" ? `/${props.uid}` : "")}>
            <MenuItem key={key}>{item.name}</MenuItem>
          </Link>
        )
      })}
      <MenuItem onClick={onLogout}>退出</MenuItem>
    </Menu>
  );
  /* mobile */
  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (<Menu
    anchorEl={mobileMoreAnchorEl} id={mobileMenuId} keepMounted
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    open={isMobileMenuOpen}
    onClose={handleMobileMenuClose}>
    <MenuItem>
      <IconButton size="large" title={"消息"} aria-label="消息" color="inherit">
        <Badge badgeContent={4} color="error">
          <MailIcon/>
        </Badge>
      </IconButton>
      <p>消息</p>
    </MenuItem>
    <MenuItem>
      <IconButton size="large" title={"通知"} aria-label="通知" color="inherit">
        <Badge badgeContent={17} color="error">
          <NotificationsIcon/>
        </Badge>
      </IconButton>
      <p>通知</p>
    </MenuItem>
    <MenuItem onClick={handleProfileMenuOpen}>
      <IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
        <AccountCircle/>
      </IconButton>
      <p>用户</p>
    </MenuItem>
  </Menu>);
  /*  */
  return (
    <Typography variant="header">
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Link to={"/"}>
              <IconButton size="large" edge="start" color="inherit" aria-label="open drawer" sx={{ mr: 2 }}>
                <LogoSVG length="36px"/>
              </IconButton>
            </Link>
            <Typography variant="h6" noWrap component="div" sx={{ fontSize: 0, lineHeight: 1, display: { xs: "none", sm: "block" } }}>
            </Typography>
            <SearchStyled>
              <SearchIconWrapper>
                <SearchIcon/>
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }}/>
            </SearchStyled>
            <Box sx={{ flexGrow: 1 }}/>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton size="large" title={"通知"} aria-label="show 4 new mails" color="inherit">
                <Badge badgeContent={4} color="error">
                  <MailIcon fontSize={"small"}/>
                </Badge>
              </IconButton>
              <IconButton size="large" title={"消息"} aria-label="show 17 new notifications" color="inherit">
                <Badge badgeContent={17} color="error">
                  <NotificationsIcon fontSize={"small"}/>
                </Badge>
              </IconButton>
              <IconButton size="large" edge="end" aria-label="account of current user" aria-controls={menuId} aria-haspopup="true"
                onClick={handleProfileMenuOpen} color="inherit">
                <AccountCircle fontSize={"small"}/>
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton size="large" aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
                <MoreIcon fontSize={"small"}/>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        {renderMobileMenu}
        {renderMenu}
      </Box>
    </Typography>
  );
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
)(PrimarySearchAppBar);
