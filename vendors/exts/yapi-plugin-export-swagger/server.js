const ExportSwaggerController = require("@server/controllers/ExportSwaggerController.js");

module.exports = function() {
  this.bindHook("add_router", function(addRouter) {
    addRouter({
      controller: ExportSwaggerController,
      method: "get",
      path: "exportSwagger",
      action: "exportData"
    })
  })
}
