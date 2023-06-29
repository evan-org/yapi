const ExportSwaggerController = require("./controller");

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
