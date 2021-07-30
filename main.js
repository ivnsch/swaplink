console.log("MAIN JS INIT");

import("./pkg").then((module) => {
  module.run_app();
});
