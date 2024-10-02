import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
//
import { Layout } from "antd";

const { Content, Sider } = Layout;
import { drawerWidth } from "@/reducer/constant.js";
//
import GroupList from "./components/GroupList/GroupList.jsx";
import GroupContent from "./components/GroupContent/GroupContent.jsx";
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
  const [collapsed, setCollapsed] = useState(false);
  //
  useEffect(() => {
    onLoad();
  }, []);
  return (
    <Layout>
      <Sider width={drawerWidth} theme={"light"}>
        <GroupList/>
      </Sider>
      <Layout
        style={{
          padding: "16px",
        }}>
        <Content>
          <GroupContent/>
        </Content>
      </Layout>
    </Layout>
  )
}
export default connect((state) => ({
  currentGroupId: state.group.currentGroupId,
}),
{
  setCurrGroup,
  fetchMyGroup
})(Group);
