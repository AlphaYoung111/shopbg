import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
//全局样式
import './assets/css/global.css'
//阿里图标
import './assets/fonts/iconfont.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
// Vue.use(axios)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
