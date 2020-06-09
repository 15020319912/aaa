import Vue from 'vue'
import Vuex from 'vuex'
import http from '../util/http.js';
import func from './func.js';
import dictionary from './dictionary';
import classroom from './classroom.js';
import role from './role.js';

Vue.use(Vuex);

export default new Vuex.Store({
        modules: { func, dictionary, classroom, role },
        state: { http },
        mutations: {},
        actions: {},
})
