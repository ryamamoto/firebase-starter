import firebase from "firebase/app";
import "firebase/auth";
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  // 値の保持
  state: {
    initialized: false,
    user: null
  },
  // 値の取得
  getters: {
    isInitialized(state) {
      return state.initialized;
    },
    isAuthenticated(state) {
      return !!state.user;
    },
    user(state) {
      return state.user;
    }
  },
  // 値の更新
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setInitialized(state) {
      state.initialized = true;
    }
  },
  // 外部から呼び出し
  actions: {
    initialize({ state, commit }) {
      if (!state.initialized) {
        firebase.auth().onAuthStateChanged(user => {
          // ログイン状態ならuserが取得できる
          if (user) {
            commit("setUser", user);
          }
          commit("setInitialized");
        });
      }
    },
    signOut({ commit }) {
      firebase.auth().signOut();
      commit("setUser", null);
    }
  }
});
