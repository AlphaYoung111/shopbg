import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
//全局样式
import './assets/css/global.css'
//阿里图标
import './assets/fonts/iconfont.css'
//table-tree
import TreeTable from 'vue-table-with-tree-grid'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
// Vue.use(axios)


//使用组件的方式去挂载
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
