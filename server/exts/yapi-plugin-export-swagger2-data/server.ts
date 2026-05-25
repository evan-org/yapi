// @ts-nocheck
import exportSwaggerController from './controller.js';


export default function() {
  this.bindHook("add_router", function(addRouter) {
    addRouter({
      controller: exportSwaggerController,
      method: "get",
      path: "exportSwagger",
      action: "exportData"
    })
  })
}
