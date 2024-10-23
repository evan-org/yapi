"use client";
import React from "react";
import { connect } from "react-redux";
//
import PropTypes from "prop-types";
import LoginForm from "packages/yapi-client/src/app/login/components/LoginForm.tsx";
import RegForm from "packages/yapi-client/src/app/login/components/RegForm.tsx";
import SwipeableViews from "react-swipeable-views";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
//
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          <Typography component={"div"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}
function LoginContainer(props) {
  const { loginWrapActiveKey, canRegister } = props;
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeIndex = (index) => {
    setValue(index);
  };
  //
  return (
    <Box container={"div"} sx={{ bgcolor: "background.paper", width: 400 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="登录" {...a11yProps(0)} />
        <Tab label="注册" {...a11yProps(1)} />
      </Tabs>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <LoginForm/>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          {canRegister ? <RegForm/> : <div style={{ minHeight: 200 }}>管理员已禁止注册，请联系管理员</div>}
        </TabPanel>
      </SwipeableViews>
    </Box>
    /*  */
    /* <Tabs defaultActiveKey={loginWrapActiveKey} className="login-form" tabBarStyle={{ border: "none" }}>
      <Tabs.TabPane tab="登录" key="1">
        <LoginForm/>
      </Tabs.TabPane>
      <Tabs.TabPane tab={"注册"} key="2">
        {canRegister ? <RegForm/> : <div style={{ minHeight: 200 }}>管理员已禁止注册，请联系管理员</div>}
      </Tabs.TabPane>
    </Tabs> */
  )
}
export default connect((state) => ({
  loginWrapActiveKey: state.user.loginWrapActiveKey,
  canRegister: state.user.canRegister
}))(LoginContainer);
