import React, { PureComponent as Component } from "react";
import NewsTimeline from "./NewsTimeline/NewsTimeline";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import SubNav from "../../components/SubNav/SubNav.jsx";
//
import { Button } from "antd";
import { getMockUrl } from "../../reducer/modules/news.js";


@connect(
  (state) => ({
    uid: state.user.uid + ""
  }),
  {
    getMockUrl: getMockUrl
  }
)
class News extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mockURL: ""
    };
  }
  static propTypes = {
    uid: PropTypes.string,
    getMockUrl: PropTypes.func
  };
  UNSAFE_componentWillMount() {
    // const that = this;
    // this.props.getMockUrl(2724).then(function(data){
    //   const { prd_host, basepath, protocol } = data.payload.data.data;
    //   const mockURL = `${protocol}://${prd_host}${basepath}/{path}`;
    //   that.setState({
    //     mockURL: mockURL
    //   })
    // })
  }
  render() {
    const subNavList = [
      {
        name: "动态",
        path: "/news"
      },
      {
        name: "测试",
        path: "/follow"
      },
      {
        name: "设置",
        path: "/follow"
      }
    ];
    return (
      <div>
        <SubNav default={"动态"} data={subNavList}/>
        <div className="g-row">
          <section className="news-box m-panel">
            <div className="logHead">
              <Breadcrumb />
              <div className="Mockurl">
                <span>Mock地址：</span>
                <p>{this.state.mockURL}</p>
                <Button type="primary">下载Mock数据</Button>
              </div>
            </div>
            <NewsTimeline />
          </section>
        </div>
      </div>
    );
  }
}

export default News;
