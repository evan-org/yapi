
import React, { PureComponent as Component } from "react";
import { Tabs } from "antd";
import PropTypes from "prop-types";
import ProjectMessage from "./ProjectMessage/ProjectMessage.js";
import ProjectEnv from "../../../components/ProjectEnv/ProjectEnv.jsx";
import ProjectRequest from "./ProjectRequest/ProjectRequest";
import ProjectToken from "./ProjectToken/ProjectToken";
import ProjectMock from "./ProjectMock/index.js";
import { connect } from "react-redux";
//
import GenServices from "@/pages/Project/Setting/GenServices/GenServices.jsx";
import SwaggerAutoSyncPage from "@/pages/Project/Setting/SwaggerAutoSync/SwaggerAutoSync.jsx";
const routers = {
  services: {
    name: "生成 ts services",
    component: GenServices
  },
  test: {
    name: "Swagger自动同步",
    component: SwaggerAutoSyncPage
  }
};
//
import "./Setting.scss";
class Setting extends Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    match: PropTypes.object,
    curProjectRole: PropTypes.string
  };

  render() {
    const id = this.props.match.params.id;
    return (
      <div className="g-row">
        <Tabs type="card" className="has-affix-footer tabs-large">
          <Tabs.TabPane tab="项目配置" key="1">
            <ProjectMessage projectId={+id}/>
          </Tabs.TabPane>
          <Tabs.TabPane tab="环境配置" key="2">
            <ProjectEnv projectId={+id}/>
          </Tabs.TabPane>
          <Tabs.TabPane tab="请求配置" key="3">
            <ProjectRequest projectId={+id}/>
          </Tabs.TabPane>
          {this.props.curProjectRole !== "guest" ? (
            <Tabs.TabPane tab="token配置" key="4">
              <ProjectToken projectId={+id} curProjectRole={this.props.curProjectRole}/>
            </Tabs.TabPane>
          ) : null}
          <Tabs.TabPane tab="全局mock脚本" key="5">
            <ProjectMock projectId={+id}/>
          </Tabs.TabPane>
          {Object.keys(routers).map((key) => {
            const C = routers[key].component;
            return <Tabs.TabPane tab={routers[key].name} key={routers[key].name}>
              <C projectId={+id}/>
            </Tabs.TabPane>
          })}
        </Tabs>
      </div>
    );
  }
}
export default connect((state) => ({
  curProjectRole: state.project.currProject.role
}))(Setting);
