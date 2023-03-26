
import React, { PureComponent as Component } from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import List from "./components/List.jsx";
import PropTypes from "prop-types";
import Profile from "./components/Profile.jsx";
import { Row } from "antd";
import styles from "./User.module.scss";
@connect(
  (state) => ({
    curUid: state.user.uid,
    userType: state.user.type,
    role: state.user.role
  }),
  {}
)
class User extends Component {
  static propTypes = {
    match: PropTypes.object,
    curUid: PropTypes.number,
    userType: PropTypes.string,
    role: PropTypes.string
  };
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className={styles.Main}>
        <div className="g-doc">
          <Row className="user-box">
            <Route path={this.props.match.path + "/list"} component={List}/>
            <Route path={this.props.match.path + "/profile/:uid"} component={Profile}/>
          </Row>
        </div>
      </div>
    );
  }
}
export default User;
