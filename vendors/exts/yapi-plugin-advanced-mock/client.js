import AdvMock from "./views/AdvMock/AdvMock.jsx";
import mockCol from "./views/MockCol/mockColReducer.jsx";

module.exports = function() {
  this.bindHook("interface_tab", function(tabs) {
    tabs.advMock = {
      name: "高级Mock",
      component: AdvMock
    }
  })
  this.bindHook("add_reducer", function(reducerModules) {
    reducerModules.mockCol = mockCol;
  })
}
