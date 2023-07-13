import {
  Box, Drawer,
  CssBaseline,
  AppBar, Toolbar, List, Typography, Divider, ListItem,
  ListItemButton, ListItemIcon, ListItemText
} from "@mui/material";
import { MoveToInbox as InboxIcon, Mail as MailIcon } from "@mui/icons-material";
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupList from "./components/GroupList/GroupList.jsx";
import GroupContent from "./components/GroupContent/GroupContent.jsx";
//
const drawerWidth = 330;
import { connect } from "react-redux";
import { fetchMyGroup, setCurrGroup } from "@/reducer/modules/group.js";
//
import styles from "./Group.module.scss";
//
function Group(props) {
  console.log(props);
  const navigate = useNavigate();
  const { groupId: paramsGroupId } = useParams();
  //
  const { setCurrGroup, fetchMyGroup } = props;
  //
  const onLoad = async() => {
    try {
      const response = await fetchMyGroup();
      const group = response.payload.data.data;
      await setCurrGroup(group, "time");
      if (!paramsGroupId) {
        navigate({ pathname: "/group/" + group._id })
      }
    } catch (e) {
      console.error(e)
    }
  }
  //
  useEffect(() => {
    onLoad();
  }, []);
  return (
    <Box sx={{ display: "flex", height: "inherit" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          ["& .MuiDrawer-paper"]: { width: drawerWidth, boxSizing: "border-box" },
        }}
        anchor="left">
        <Toolbar/>
        <Box sx={{overflow: "hidden"}}>
          <GroupList/>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
        <GroupContent/>
      </Box>
    </Box>
  )
}
export default connect((state) => ({
  currentGroupId: state.group.currentGroupId,
}),
{
  setCurrGroup,
  fetchMyGroup
})(Group)
