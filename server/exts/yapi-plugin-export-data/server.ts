// @ts-nocheck
import controller from './controller.js';


// import _ from 'underscore';


export default function() {
  this.bindHook("add_router", function(addRouter) {
    addRouter({
      controller: controller,
      method: "get",
      path: "export",
      action: "exportData"
    })
  })

}
