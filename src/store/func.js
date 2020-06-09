export default {
        namespaced: true,
        state: {
                isInit: false,          //标识当前仓库的list有没有向服务器请求初始化过
                list: [],                       // 当前系统所有可用功能
        },
        //getters节点相当于仓库数据的计算属性节点
        //如果多个组件在使用仓库中的state里的数据是都要进行计算，在使用，没有必要每个
        //组件都去计算一遍，只要在仓库的1getters节点计算一下，然后各个组件直接用就可以了
        getters: {
                listWithTree: function(state){
                        var result = [];
                        var temp = null, children = null;
                        //一级菜单
                        state.list.filter(item => item.func_fid === 0).forEach(item => {
                                temp = Object.assign({}, item);  //深复制item
                                // 找当前一级的二级菜单
                                children = state.list.filter(item2 => item2.func_fid === item.func_id);
                                if(children.length > 0) {  //说明当前的一级菜单有二级菜单
                                        temp.children = [];
                                        children.forEach(item2 => temp.children.push(Object.assign({}, item2)));
                                }
                                result.push(temp);
                        });
                        return result;
                }
        },
        mutations: {
                _init: function(state, list){
                        state.isInit = true;
                        state.list = list;
                },
                _remove: function(state, func_id){
                        var i = state.list.findIndex(item => item.func_id === func_id);
                        state.list.splice(i, 1);
                },
                _add: function(state, func){
                        state.list.push(func);
                },
                _update:function(state, func){
                        var i = state.list.findIndex(item => item.func_id === func.func_id);
                        state.list.splice(i, 1, func);
                }
        },
        actions: {
                init: function(context){
                        if(context.state.isInit) return;
                        context.rootState.http({
                                url: '/function/all',
                                method: 'get'
                        }).then(list => context.commit('_init', list));
                },
                remove: function(context, func_id){
                        //向服务器发送ajax请求删除指定的功能节点
                        return context.rootState.http({
                                url: '/function/remove/' + func_id,
                                method: 'post'
                        }).then(() => context.commit('_remove', func_id));
                        // 服务器回来后，在调用mutations中的_remove发放更新
                },
                add: function(context, func){
                        return context.rootState.http({
                                url: '/function/add',
                                method: 'post',
                                data: func
                        }).then(func_id => context.commit('_add', Object.assign({}, func, {func_id})));
                },
                update: function(context, func){
                        return context.rootState.http({
                                url: '/function/update',
                                method: 'post',
                                data: func
                        }).then(() => context.commit('_update', Object.assign({}, func)));
                }
        }
}


























