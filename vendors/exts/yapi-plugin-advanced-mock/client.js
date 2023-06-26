import AdvMock from "./views/AdvMock/AdvMock.js";
import mockCol from "./views/MockCol/mockColReducer.js";

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
