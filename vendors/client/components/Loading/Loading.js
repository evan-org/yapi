import React from "react";
import PropTypes from "prop-types";
import style from "./Loading.module.scss";

export default class Loading extends React.PureComponent {
  static defaultProps = {
    visible: false
  };
  static propTypes = {
    visible: PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.state = { show: props.visible };
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ show: nextProps.visible });
  }
  render() {
    return (
      <div className={style.Loading}>
        <div className="loading-box" style={{ display: this.state.show ? "flex" : "none" }}>
          <div className="loading-box-bg" />
          <div className="loading-box-inner">
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      </div>
    );
  }
}
