/**
 * Created by gxl.gao on 2017/10/24.
 */
import StatisticsPage from "./views/StatisticsClientPage/StatisticsClientPage.js";

module.exports = function() {
  this.bindHook("app_route", function(app) {
    if (app instanceof Object) {
      app.statisticsPage = {
        path: "/statistic",
        component: StatisticsPage,
        element: StatisticsPage,
        meta: { title: "我的项目组", auth: true }
      }
    }
    if (Array.isArray(app)) {
      app.push({
        path: "/statistic",
        element: StatisticsPage,
        meta: { title: "我的项目组", auth: true }
      })
    }
  })
}
