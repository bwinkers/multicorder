import Multicorder from "./multicorder.vue";

function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component("v-multicorder", Multicorder);
}

const plugin = {
  install,
};

let GlobalVue = null;
if (typeof window !== "undefined") {
  GlobalVue = window.Vue;
} else if (typeof global !== "undefined") {
  GlobalVue = global.vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

Multicorder.install = install;

export default Multicorder;
