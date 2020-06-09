export default {
        namespaced: true,
        state: {
                list: [],        //存放角色信息
                isInit: false,     //标识是否初始化过角色信息
        },
        getters: {},
        mutations: {
                _init: function(state, list) {
                        state.isInit = true;
                        state.list = list;
                },
                _remove: function(state, role_id){
                        var i =state.list.findIndex(item => item.role_id === role_id);
                        state.list.splice(i, 1);
                },
                _add: function(state, role){
                        state.list.push(role);
                },
                _update: function(state, role){
                        var i = state.list.findIndex(item => item.role_id === role.role_id);
                        state.list.splice(i, 1, role);
                }
        },
        actions: {
                init: function(context){
                        if(context.state.isInit) return;
                        context.rootState.http({
                                url: '/role/all',
                                method: 'get'
                        }).then(list => context.commit('_init', list));
                },
                remove: function(context, role_id){
                        //向服务器发送ajax请求删除指定的功能节点
                        return context.rootState.http({
                                url: '/role/remove/' + role_id,
                                method: 'post'
                        }).then(() => context.commit('_remove', role_id));
                        //服务器回来后，在调用mutations中的_remove方法更新state中的list
                },
                add: function(context, role){
                        return context.rootState.http({
                                url: '/role/add',
                                method: 'post',
                                data: role
                        }).then(role_id => context.commit('_add', Object.assign({}, role, { role_id } )));
                },
                update: function(context, role){
                        return context.rootState.http({
                                url: '/role/update',
                                method: 'post',
                                data: role
                        }).then(() => context.commit('_update', Object.assign({}, role)));
                }
        },
}