import WikiPage from "./WikiPage/WikiPage";
// const WikiPage = require('./WikiPage/index')

module.exports = function() {
  this.bindHook("sub_nav", function(app) {
    app.wiki = {
      name: "Wiki",
      path: "/project/:id/wiki",
      component: WikiPage
    };
  });
};
