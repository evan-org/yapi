import React, { PureComponent as Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import request from "@/service/request.js";
import { Table, Button, Modal, message, Tooltip, Select } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { fetchInterfaceListMenu, fetchInterfaceList, fetchInterfaceCatList } from "@/reducer/modules/interface.js";
import { getProject } from "@/reducer/modules/project.js";
import { Link } from "react-router-dom";
import variable from "@/utils/variable.js";
import Label from "@/components/Label/Label.jsx";
//
import AddInterfaceForm from "@/pages/Project/Interface/InterfaceMenu/AddInterfaceForm.jsx";
import styles from "./InterfaceList.module.scss";
//
const limit = 20;
class InterfaceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: [],
      filteredInfo: {},
      catid: null,
      total: null,
      current: 1
    };
  }
  static propTypes = {
    curData: PropTypes.object,
    catList: PropTypes.array,
    match: PropTypes.object,
    curProject: PropTypes.object,
    history: PropTypes.object,
    fetchInterfaceListMenu: PropTypes.func,
    fetchInterfaceList: PropTypes.func,
    fetchInterfaceCatList: PropTypes.func,
    totalTableList: PropTypes.array,
    catTableList: PropTypes.array,
    totalCount: PropTypes.number,
    count: PropTypes.number,
    getProject: PropTypes.func
  };
  handleRequest = async(props) => {
    const { params } = props.match;
    if (!params.actionId) {
      let projectId = params.id;
      this.setState({
        catid: null
      });
      let option = {
        page: this.state.current,
        limit,
        project_id: projectId,
        status: this.state.filteredInfo.status,
        tag: this.state.filteredInfo.tag
      };
      await this.props.fetchInterfaceList(option);
    } else if (isNaN(params.actionId)) {
      let catid = params.actionId.substr(4);
      this.setState({ catid: +catid });
      let option = {
        page: this.state.current,
        limit,
        catid,
        status: this.state.filteredInfo.status,
        tag: this.state.filteredInfo.tag
      };
      await this.props.fetchInterfaceCatList(option);
    }
  };
  // 更新分类简介
  handleChangeInterfaceCat = (desc, name) => {
    let params = {
      catid: this.state.catid,
      name: name,
      desc: desc
    };
    request.post("/interface/up_cat", params).then(async(res) => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      let project_id = this.props.match.params.id;
      await this.props.getProject(project_id);
      await this.props.fetchInterfaceListMenu(project_id);
      message.success("接口集合简介更新成功");
    });
  };
  handleChange = (pagination, filters, sorter) => {
    this.setState({
      current: pagination.current || 1,
      sortedInfo: sorter,
      filteredInfo: filters
    }, () => this.handleRequest(this.props));
  };
  UNSAFE_componentWillMount() {
    this.actionId = this.props.match.params.actionId;
    this.handleRequest(this.props);
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    let _actionId = nextProps.match.params.actionId;
    if (this.actionId !== _actionId) {
      this.actionId = _actionId;
      this.setState(
        {
          current: 1
        },
        () => this.handleRequest(nextProps)
      );
    }
  }
  handleAddInterface = (data) => {
    data.project_id = this.props.curProject._id;
    request.post("/interface/add", data).then((res) => {
      if (res.data.errcode !== 0) {
        return message.error(`${res.data.errmsg}, 你可以在左侧的接口列表中对接口进行删改`);
      }
      message.success("接口添加成功");
      let interfaceId = res.data.data._id;
      this.props.history.push("/project/" + data.project_id + "/interface/api/" + interfaceId);
      this.props.fetchInterfaceListMenu(data.project_id);
    });
  };
  changeInterfaceCat = async(id, catid) => {
    const params = {
      id: id,
      catid
    };
    let result = await request.post("/interface/up", params);
    if (result.data.errcode === 0) {
      message.success("修改成功");
      this.handleRequest(this.props);
      this.props.fetchInterfaceListMenu(this.props.curProject._id);
    } else {
      message.error(result.data.errmsg);
    }
  };
  changeInterfaceStatus = async(value) => {
    const params = {
      id: value.split("-")[0],
      status: value.split("-")[1]
    };
    let result = await request.post("/interface/up", params);
    if (result.data.errcode === 0) {
      message.success("修改成功");
      this.handleRequest(this.props);
    } else {
      message.error(result.data.errmsg);
    }
  };
  // page change will be processed in handleChange by pagination
  // changePage = current => {
  //   if (this.state.current !== current) {
  //     this.setState(
  //       {
  //         current: current
  //       },
  //       () => this.handleRequest(this.props)
  //     );
  //   }
  // };
  render() {
    let tag = this.props.curProject.tag;
    let tagFilter = tag.map((item) => ({ text: item.name, value: item.name }));
    const columns = [
      {
        title: "接口名称",
        dataIndex: "title",
        key: "title",
        width: 30,
        render: (text, item) => (
          <Link to={"/project/" + item.project_id + "/interface/api/" + item._id}>
            <span className="path">{text}</span>
          </Link>
        )
      },
      {
        title: "接口路径",
        dataIndex: "path",
        key: "path",
        width: 50,
        render: (item, record) => {
          const path = this.props.curProject.basepath + item;
          let methodColor =
            variable.METHOD_COLOR[record.method ? record.method.toLowerCase() : "get"] ||
            variable.METHOD_COLOR["get"];
          return (
            <div>
              <span
                style={{ color: methodColor.color, backgroundColor: methodColor.bac }}
                className="colValue"
              >
                {record.method}
              </span>
              <Tooltip title="开放接口" placement="topLeft">
                <span>{record.api_opened && <EyeOutlined className="opened"/>}</span>
              </Tooltip>
              <Tooltip title={path} placement="topLeft" overlayClassName="toolTip">
                <span className="path">{path}</span>
              </Tooltip>
            </div>
          );
        }
      },
      {
        title: "接口分类",
        dataIndex: "catid",
        key: "catid",
        width: 28,
        render: (item, record) => (
          <Select
            value={item + ""}
            className="select path"
            onChange={(catid) => this.changeInterfaceCat(record._id, catid)}
          >
            {this.props.catList.map((cat) => (
              <Select.Option key={cat.id + ""} value={cat._id + ""}>
                <span>{cat.name}</span>
              </Select.Option>
            ))}
          </Select>
        )
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 24,
        render: (text, record) => {
          const key = record.key;
          return (
            <Select
              value={key + "-" + text}
              className="select"
              onChange={this.changeInterfaceStatus}
            >
              <Select.Option value={key + "-done"}>
                <span className="tag-status done">已完成</span>
              </Select.Option>
              <Select.Option value={key + "-undone"}>
                <span className="tag-status undone">未完成</span>
              </Select.Option>
            </Select>
          );
        },
        filters: [
          {
            text: "已完成",
            value: "done"
          },
          {
            text: "未完成",
            value: "undone"
          }
        ],
        onFilter: (value, record) => record.status.indexOf(value) === 0
      },
      {
        title: "tag",
        dataIndex: "tag",
        key: "tag",
        width: 14,
        render: (text) => {
          let textMsg = text.length > 0 ? text.join("\n") : "未设置";
          return <div className="table-desc">{textMsg}</div>;
        },
        filters: tagFilter,
        onFilter: (value, record) => record.tag.indexOf(value) >= 0
      }
    ];
    let intername = "",
      desc = "";
    let cat = this.props.curProject ? this.props.curProject.cat : [];
    if (cat) {
      for (let i = 0; i < cat.length; i++) {
        if (cat[i]._id === this.state.catid) {
          intername = cat[i].name;
          desc = cat[i].desc;
          break;
        }
      }
    }
    // const data = this.state.data ? this.state.data.map(item => {
    //   item.key = item._id;
    //   return item;
    // }) : [];
    let data = [];
    let total = 0;
    const { params } = this.props.match;
    if (!params.actionId) {
      data = this.props.totalTableList;
      total = this.props.totalCount;
    } else if (isNaN(params.actionId)) {
      data = this.props.catTableList;
      total = this.props.count;
    }
    data = data.map((item) => {
      item.key = item._id;
      return item;
    });
    const pageConfig = {
      total: total,
      pageSize: limit,
      current: this.state.current
      // onChange: this.changePage
    };
    const isDisabled = this.props.catList.length === 0;
    // console.log(this.props.curProject.tag)
    return (
      <div className={styles.InterfaceList}>
        <h2 className="interface-title" style={{ display: "inline-block", margin: 0 }}>
          {intername ? intername : "全部接口"}共 ({total}) 个
        </h2>
        <Button
          style={{ float: "right" }}
          disabled={isDisabled}
          type="primary"
          onClick={() => this.setState({ visible: true })}
        >
          添加接口
        </Button>
        <div style={{ marginTop: "10px" }}>
          <Label onChange={(value) => this.handleChangeInterfaceCat(value, intername)} desc={desc}/>
        </div>
        <Table
          className="table-interfacelist"
          pagination={pageConfig}
          columns={columns}
          onChange={this.handleChange}
          dataSource={data}
        />
        {this.state.visible && (
          <Modal
            title="添加接口"
            visible={this.state.visible}
            onCancel={() => this.setState({ visible: false })}
            footer={null}
            className="addcatmodal"
          >
            <AddInterfaceForm
              catid={this.state.catid}
              catdata={cat}
              onCancel={() => this.setState({ visible: false })}
              onSubmit={this.handleAddInterface}
            />
          </Modal>
        )}
      </div>
    );
  }
}
export default connect(
  (state) => ({
    curData: state.inter.curdata,
    curProject: state.project.currProject,
    catList: state.inter.list,
    totalTableList: state.inter.totalTableList,
    catTableList: state.inter.catTableList,
    totalCount: state.inter.totalCount,
    count: state.inter.count
  }),
  {
    fetchInterfaceListMenu,
    fetchInterfaceList,
    fetchInterfaceCatList,
    getProject
  }
)(InterfaceList);
