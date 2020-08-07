import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import dbUtil from "@/util/dbUtil";

Vue.config.productionTip = false;

Vue.prototype.$dbUtil = dbUtil;

Vue.use(ElementUI);
new Vue({
  render: h => h(App)
}).$mount("#app");
