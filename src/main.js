import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/reset.css';            //导入复位样式
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/reset.css';
import  http from './util/http';
//这行代码非常重要，有了这行代码，我们就可以在项目
//的任何组件中无条件直接使用ElementUI框架
//提供的各种组件
Vue.use(ElementUI);
Vue.prototype.$http = http;

Vue.config.productionTip = false

new Vue({
        router,
        store,
        render: h => h(App)
}).$mount('#app')
