import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

Vue.use(Buefy)

Vue.config.productionTip = false

// ユーザー情報を取得
store.dispatch('initialize')

// ルートガード
// 未認証の場合には、signinページにリダイレクトする処理
const requiresAuthGuard = (next) => {
  if (store.getters.isAuthenticated) {
    next()
  } else {
    next({ path: '/signin' })
  }
}

// 認証済の場合には、TOPページにリダイレクトする処理
const signinGuard = (next) => {
  if (store.getters.isAuthenticated) {
    next({ path: '/' })
  } else {
    next()
  }
}

// storeの初期化が終わるのを待ってページ遷移の可否を判定
const routerGuard = (next, guard) => {
  if (!store.getters.isInitialized) {
    // initializedフラグが変わる = 初期化が終わるまで待つ
    const unwatch = store.watch((state) => state.initialized, () => {
      guard(next)
      unwatch()
    })
  } else {
    guard(next)
  }
}

// グローバルガード
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // ルーティングのmetaプロパティに`requiresAuth`が設定されていた場合、未認証のユーザーはsigninページに遷移できない
    routerGuard(next, requiresAuthGuard)
  } else if (to.path === '/signin') {
    // 認証済のユーザーはsigninページへは遷移できない
    routerGuard(next, signinGuard)
  } else {
    next()
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
