export default {
        namespaced: true,
        state: {
                list: [],               // 保存系统的字典表中的所有数据，随时为各组件服务
                isInit: false           // 标识系统的字典表的数据有没有初始化过
        },
        getters: {
                getGroupByKey: (state) => {
                        return dic_group_key => state.list.filter(item => item.dic_group_key === dic_group_key);
                },
                getNameById(state) {
                        return dic_id => state.list.find(item => item.dic_id === dic_id).dic_name;
                }
        },
        mutations: {
                _init(state, list) {
                        state.isInit = true;
                        state.list = list;
                }
        },
        actions: {
                init(context) {
                        if(context.state.isInit) return Promise.resolve();
                        return context.rootState.http({
                                url: '/dictionary/all',
                                method: 'get'
                        }).then(list => context.commit('_init', list));
                }
        }
};