import React, { useState, useEffect, PureComponent as Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useNavigate, useParams, Outlet, useMatch, useLocation, useMatches } from "react-router-dom";
import { SubNav } from "@/components/index.js";
import Loading from "@/components/Loading/Loading.jsx";
//
import Interface from "./Interface/Interface.jsx";
import Activity from "./Activity/Activity.jsx";
import Setting from "./Setting/Setting.jsx";
import Members from "@/pages/Project/Members/Members.jsx";
import Data from "@/pages/Project/Data/Data.jsx";
import Wiki from "@/pages/Project/Wiki/Wiki.jsx";
//
import { fetchGroupMsg } from "@/reducer/modules/group.js";
import { setBreadcrumb } from "@/reducer/modules/user.js";
import { getProject } from "@/reducer/modules/project.js";
//
function ProjectMain(props) {
  //
  const [defaultName, setDefaultName] = useState("接口");
  const [subNavData, setSubNavData] = useState([]);
  const { curProject, currGroup } = props;
  const navigate = useNavigate();
  // const matches = useMatches();
  // console.log(matches);
  const match = useMatch("/project/:id/:action");
  console.log(navigate, match);
  //
  const routers = {
    interface: { name: "接口", path: "/project/:id/interface/:action", component: Interface },
    activity: { name: "动态", path: "/project/:id/activity", component: Activity },
    data: { name: "数据管理", path: "/project/:id/data", component: Data },
    members: { name: "成员管理", path: "/project/:id/members", component: Members },
    setting: { name: "设置", path: "/project/:id/setting", component: Setting },
    wiki: { name: "Wiki", path: "/project/:id/wiki", component: Wiki }
  };
  //
  useEffect(() => {
    // for (const key in routers) {
    //   if (useMatch(routers[key].path)) {
    //     setDefaultName(routers[key].name);
    //     break;
    //   }
    // }
    Object.keys(routers).forEach((key) => {
      let item = routers[key];
      let value = {};
      if (key === "interface") {
        value = {
          name: item.name,
          path: `/project/${match.params.id}/interface/api`
        };
      } else {
        value = {
          name: item.name,
          path: item.path.replace(/\:id/gi, match.params.id)
        };
      }
      setSubNavData((prev) => [...prev, value]);
    });
    //
    if (currGroup.type === "private") {
      setSubNavData((prev) => prev.filter((item) => item.name !== "成员管理"));
    }
  }, []);
  //
  useEffect(() => {
    void onInitData();
  }, [match.params.id]);
  //
  const onInitData = async() => {
    const { currGroup, getProject, fetchGroupMsg, curProject, setBreadcrumb } = props;
    await getProject(match.params.id);
    await fetchGroupMsg(curProject.group_id);
    setBreadcrumb([
      {
        name: currGroup.group_name,
        href: "/group/" + currGroup._id
      },
      {
        name: curProject.name
      }
    ]);
  }
  //
  if (curProject == null || Object.keys(curProject).length === 0) {
    return <Loading visible/>;
  }
  //
  return (
    <div>
      <SubNav default={defaultName} data={subNavData}/>
      <Outlet/>
      {/* <Switch>*/}
      {/*  <Redirect exact from="/project/:id" to={`/project/${match.params.id}/interface/api`}/>*/}
      {/*  <Route path={routers.activity.path} component={Activity}/>*/}
      {/*  <Route path={routers.setting.path} component={Setting}/>*/}
      {/*  {this.props.currGroup.type !== "private"*/}
      {/*    ? <Route path={routers.members.path} component={routers.members.component}/>*/}
      {/*    : null*/}
      {/*  }*/}
      {/*  <Route path={routers.data.path} component={Data}/>*/}
      {/*  {Object.keys(routers).map((key) => {*/}
      {/*    let item = routers[key];*/}
      {/*    return key === "members" ? (*/}
      {/*      this.props.currGroup.type !== "private" ? (*/}
      {/*        <Route path={item.path} component={item.component} key={key}/>*/}
      {/*      ) : null*/}
      {/*    ) : (*/}
      {/*      <Route path={item.path} component={item.component} key={key}/>*/}
      {/*    );*/}
      {/*  })}*/}
      {/* </Switch>*/}
    </div>
  )
}
export default connect(
  (state) => ({
    curProject: state.project.currProject,
    currGroup: state.group.currGroup
  }),
  {
    getProject,
    fetchGroupMsg,
    setBreadcrumb
  }
)(ProjectMain);
