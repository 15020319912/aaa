// 自定义一个函数http，封装版的axios， 然后导出
import axios from 'axios';
import { Loading, Message, MessageBox } from 'element-ui';
import router from '../router';

var alwaysPendingPromise = new Promise(() => {});

function http(options){
        var loading = Loading.service({
                lock: true,
                text: 'Loading',
                spinner: 'el-icon-loading',
                bgckground: 'rgba(0, 0, 0, 0.6 )'
        });
        options.headers = { Authorization: sessionStorage.getItem('token') };
        return axios(options)
        // 主要是排除物理失败
                .then(response => {
                        return new Promise(resolve => {
                                setTimeout(() => {
                                        loading.close();
                                        resolve(response);
                                }, 1000);
                        })
                })
                .then(response => {
                        if (response.status === 200) return Promise.resolve(response.data);
                        else return Promise.reject(new Error(response.statusText));
                })
                // 主要是排除逻辑失败
                .then(result => {
                        switch (result.status) {
                                case 200:
                                        return Promise.resolve(result.data);
                                case 401:
                                        sessionStorage.removeItem('token');             //避免用户直接看home的残留
                                        // isExist401是一个放在sessionStorage中的标记，避免登录超时后的操做多次触发弹窗事件
                                        if(!sessionStorage.getItem('isExist401')) {
                                                sessionStorage.setItem('isExist401', true);
                                                MessageBox({
                                                        title: '提示',
                                                        message: '您未登录或登录超时，请重新登录！',
                                                        type: 'warning',
                                                        showClose: false,                               // 不显示关闭按钮
                                                        closeOnClickModel: false,                  // 点遮罩关不掉
                                                        closeOnPressEscape: false                 // 按ESC关不掉
                                                })
                                                        .then(() => router.replace('/login'));
                                        }
                                        return alwaysPendingPromise;
                                case 404:
                                        MessageBox({ title: '提示', message: '您和服务器断开了连接！', type: 'warning' })
                                                .then(() => { });
                                        return alwaysPendingPromise;
                                case 199:
                                case 500:
                                        return Promise.reject(new Error(result.message));


                        }
                })
                // 不管是物理还是逻辑失败都会来到这里,我是一个托底的catch,前面n多个then只要出错都会到我这来统一处理
                .catch(error => {
                        Message({ message:  error.message, type: 'error'});
                        loading.close();
                        return alwaysPendingPromise;
                });
}

//导出http函数
export default http;