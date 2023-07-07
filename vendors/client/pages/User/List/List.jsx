import React, { PureComponent as Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
//
import { formatTime } from "@/utils/common";
import { setBreadcrumb } from "@/reducer/modules/user";
import { Table, Popconfirm, message, Input } from "antd";
import request from "@/service/request.js";
//
const limit = 20;
class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total: null,
      current: 1,
      backups: [],
      isSearch: false
    };
  }
  static propTypes = {
    setBreadcrumb: PropTypes.func,
    curUserRole: PropTypes.string
  };
  changePage = (current) => {
    this.setState(
      {
        current: current
      },
      this.getUserList
    );
  };
  getUserList() {
    request.get("/user/list", { page: this.state.current, limit: limit }).then((res) => {
      let result = res.data;
      if (result.errcode === 0) {
        let list = result.data.list;
        let total = result.data.count;
        list.map((item, index) => {
          item.key = index;
          item.up_time = formatTime(item.up_time);
        });
        this.setState({
          data: list,
          total: total,
          backups: list
        });
      }
    });
  }
  componentDidMount() {
    this.getUserList();
  }
  confirm = (uid) => {
    request.post("/user/del", { id: uid }).then((res) => {
      if (res.data.errcode === 0) {
        message.success("已删除此用户");
        let userlist = this.state.data;
        userlist = userlist.filter((item) => item._id != uid);
        this.setState({
          data: userlist
        });
      } else {
        message.error(res.data.errmsg);
      }
    }).catch((err) => {
      message.error(err.message);
    })
  };
  async UNSAFE_componentWillMount() {
    this.props.setBreadcrumb([{ name: "用户管理" }]);
  }
  handleSearch = (value) => {
    let params = { q: value };
    if (params.q !== "") {
      request.get("/user/search", params).then((data) => {
        let userList = [];
        data = data.data.data;
        if (data) {
          userList = data.map((v) => ({ ...v, _id: v.uid }));
        }
        this.setState({
          data: userList,
          isSearch: true
        });
      });
    } else {
      this.setState({
        data: this.state.backups,
        isSearch: false
      });
    }
  };
  render() {
    const role = this.props.curUserRole;
    let data = [];
    if (role === "admin") {
      data = this.state.data;
    }
    let columns = [
      {
        title: "用户名",
        dataIndex: "username",
        key: "username",
        width: 180,
        render: (username, item) => <Link to={"/user/profile/" + item._id}>{item.username}</Link>
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email"
      },
      {
        title: "用户角色",
        dataIndex: "role",
        key: "role",
        width: 150
      },
      {
        title: "更新日期",
        dataIndex: "up_time",
        key: "up_time",
        width: 160
      },
      {
        title: "功能",
        key: "action",
        width: "90px",
        render: (item) => (
          <span>
            {/* <span className="ant-divider" /> */}
            <Popconfirm
              title="确认删除此用户?"
              onConfirm={() => {
                this.confirm(item._id);
              }}
              okText="确定"
              cancelText="取消"
            >
              <a style={{ display: "block", textAlign: "center" }} href="User#">
                  删除
              </a>
            </Popconfirm>
          </span>
        )
      }
    ];
    columns = columns.filter((item) => !(item.key === "action" && role !== "admin"));
    //
    const pageConfig = {
      total: this.state.total,
      pageSize: limit,
      current: this.state.current,
      onChange: this.changePage
    };
    const defaultPageConfig = {
      total: this.state.data.length,
      pageSize: limit,
      current: 1
    };
    return (
      <section className="user-table">
        <div className="user-search-wrapper">
          <h2 style={{ marginBottom: "10px" }}>用户总数：{this.state.total}位</h2>
          <Input.Search onChange={(e) => this.handleSearch(e.target.value)} onSearch={this.handleSearch} placeholder="请输入用户名"/>
        </div>
        <Table bordered rowKey={(record) => record._id} columns={columns} pagination={this.state.isSearch ? defaultPageConfig : pageConfig}
          dataSource={data}/>
      </section>
    );
  }
}
export default connect(
  (state) => ({
    curUserRole: state.user.role
  }),
  {
    setBreadcrumb
  }
)(List);
