import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../pages/Home';
import Login from '../pages/Login';

Vue.use(VueRouter);

const routes = [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        { path: '/home', component: Home }
];


const router = new VueRouter({
        mode: 'hash',
        base: process.env.BASE_URL,
        routes
});

//绑定router路由对象全局钩子函数，对登录进行验证判断（路由守卫）
router.beforeEach((to, from, next) => {
        //如果访问的不是登录页面，且没有登录
        if(to.path !== '/login' && !sessionStorage.getItem('token'))
                next('/login');
        else
                next();
});

export default router;
