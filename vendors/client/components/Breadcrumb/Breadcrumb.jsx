import React, { PureComponent as Component } from "react";
import { withRouter, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Breadcrumb } from "antd";
import styles from "./Breadcrumb.module.scss";
//
@connect(
  (state) => ({
    breadcrumb: state.user.breadcrumb
  }))
@withRouter
class BreadcrumbNavigation extends Component {
  constructor(props) {
    super(props);
  }
  static propTypes = {
    breadcrumb: PropTypes.array
  };
  render() {
    const getItem = this.props.breadcrumb.map((item, index) => {
      if (item.href) {
        return (
          <Breadcrumb.Item key={index}>
            <Link to={item.href}>{item.name}</Link>
          </Breadcrumb.Item>
        );
      } else {
        return <Breadcrumb.Item key={index}>{item.name}</Breadcrumb.Item>;
      }
    });
    return (
      <div className={styles.BreadcrumbContainer}>
        <Breadcrumb>{getItem}</Breadcrumb>
      </div>
    );
  }
}
export default BreadcrumbNavigation
