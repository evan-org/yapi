const GenServicesController = require("@server/controllers/GenServicesController.js");

// const mongoose = require('mongoose');
// const _ = require('underscore');

module.exports = function() {
  this.bindHook("add_router", function(addRouter) {
    // @feat: serives
    addRouter({
      controller: GenServicesController,
      method: "get",
      prefix: "/open",
      path: "export-full",
      action: "exportFullData"
    });
  })

}
