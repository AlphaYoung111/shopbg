import Vue from 'vue'
import App from './App.vue'
import router from './router'
//全局样式
import './assets/css/global.css'
//阿里图标
import './assets/fonts/iconfont.css'
//table-tree
import TreeTable from 'vue-table-with-tree-grid'
// vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// echarts
import echarts from 'echarts'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
// Vue.use(axios)

Vue.use(VueQuillEditor)
//使用组件的方式去挂载
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false
Vue.prototype.$echarts = echarts

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
