import React, { PureComponent as Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import ProjectCard from "../../components/ProjectCard/ProjectCard.jsx";
import ErrMsg from "../../components/ErrMsg/ErrMsg.jsx";
//
import { getFollowList } from "../../reducer/modules/follow";
import { setBreadcrumb } from "../../reducer/modules/user";
//
import styles from "./Follows.module.scss";

class Follow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  static propTypes = {
    getFollowList: PropTypes.func,
    setBreadcrumb: PropTypes.func,
    uid: PropTypes.number
  };
  receiveRes = () => {
    this.props.getFollowList(this.props.uid).then((res) => {
      if (res.payload.data.errcode === 0) {
        this.setState({
          data: res.payload.data.data.list
        });
      }
    });
  };
  async UNSAFE_componentWillMount() {
    this.props.setBreadcrumb([{ name: "我的关注" }]);
    this.props.getFollowList(this.props.uid).then((res) => {
      if (res.payload.data.errcode === 0) {
        this.setState({
          data: res.payload.data.data.list
        });
      }
    });
  }
  render() {
    let data = this.state.data;
    data = data.sort((a, b) => b.up_time - a.up_time);
    return (
      <div className={styles.Follows}>
        <div className="g-row" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
          <Row gutter={16} className="follow-box pannel-without-tab">
            {data.length ? (
              data.map((item, index) => (
                <Col xs={6} md={4} xl={3} key={index}>
                  <ProjectCard
                    projectData={item}
                    inFollowPage
                    callbackResult={this.receiveRes}
                  />
                </Col>
              ))
            ) : (
              <ErrMsg type="noFollow"/>
            )}
          </Row>
        </div>
      </div>
    );
  }
}
export default connect(
  (state) => ({
    data: state.follow.data,
    uid: state.user.uid
  }),
  {
    getFollowList,
    setBreadcrumb
  }
)(Follow);
