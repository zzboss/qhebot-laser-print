import Vue from "vue";
import App from "./App.vue";
import dbUtil from "@/util/db";

Vue.config.productionTip = false;

Vue.prototype.$dbUtil = dbUtil;
new Vue({
  render: h => h(App)
}).$mount("#app");
