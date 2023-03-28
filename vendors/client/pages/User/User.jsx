
import React, { PureComponent as Component } from "react";
import { connect } from "react-redux";
import {Outlet} from "react-router-dom"
import PropTypes from "prop-types";
//
import styles from "./User.module.scss";
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
        <Outlet/>
      </div>
    );
  }
}
export default connect(
  (state) => ({
    curUid: state.user.uid,
    userType: state.user.type,
    role: state.user.role
  }),
  {}
)(User);
