export default {
        namespaced: true,
        state: {
                list: [],               //存放教室信息
                isInit: false,     //标识是否初始化过教室信息
        },
        getters: {
                getNameById(state) {
                        return clsr_id => state.list.length > 0 ? state.list.find(item => item.clsr_id === clsr_id).clsr_name: '';
                }
        },
        mutations: {
                toggleStatus(state, clsr_id) { // 教室占用或闲置状态切换
                        var i = state.list.findIndex(item => item.clsr_id === clsr_id);
                        var obj = Object.assign({}, state.list[i]);
                        obj.clsr_occupy = obj.clsr_occupy === 1 ? 0 : 1;
                        state.list.splice(i, 1, obj);
                },
                _init: function(state, list) {
                        state.isInit = true;
                        state.list = list;
                },
                _remove: function(state, clsr_id){
                        var i =state.list.findIndex(item => item.clsr_id === clsr_id);
                        state.list.splice(i, 1);
                },
                _add: function(state, classroom){
                        state.list.push(classroom);
                },
                _update: function(state, classroom){
                        var i = state.list.findIndex(item => item.clsr_id === classroom.clsr_id);
                        state.list.splice(i, 1, classroom);
                }

        },
        actions: {
                init: function(context){
                        if(context.state.isInit) return Promise.resolve();
                        return context.rootState.http({
                                url: '/classroom/all',
                                method: 'get'
                        }).then(list => context.commit('_init', list));
                },
                remove: function(context, clsr_id){
                        //向服务器发送ajax请求删除指定的功能节点
                        return context.rootState.http({
                                url: '/classroom/remove/' + clsr_id,
                                method: 'get'
                        }).then(() => context.commit('_remove', clsr_id));
                        //服务器回来后，在调用mutations中的_remove方法更新state中的list
                },
                add: function(context, classroom){
                        return context.rootState.http({
                                url: '/classroom/add',
                                method: 'post',
                                data: classroom
                        }).then(clsr_id => context.commit('_add', Object.assign({}, classroom, { clsr_id } )));
                },
                update: function(context, classroom){
                        return context.rootState.http({
                                url: '/classroom/update',
                                method: 'post',
                                data: classroom
                        }).then(() => context.commit('_update', Object.assign({}, classroom)));
                }
        }
}