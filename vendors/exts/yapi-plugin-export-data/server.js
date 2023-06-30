const ExportDataController = require("@server/controllers/ExportDataController.js");
// const mongoose = require('mongoose');
// const _ = require('underscore');
module.exports = function() {
  this.bindHook("add_router", function(addRouter) {
    addRouter({
      controller: ExportDataController,
      method: "get",
      path: "export",
      action: "exportData"
    })
  })
}
