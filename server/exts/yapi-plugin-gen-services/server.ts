// @ts-nocheck
import controller from './controller.js';


// import _ from 'underscore';


export default function() {
  this.bindHook("add_router", function(addRouter) {
    // @feat: serives
    addRouter({
      controller: controller,
      method: "get",
      prefix: "/open",
      path: "export-full",
      action: "exportFullData"
    });
  })

}
