<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a href="https://auth-test-fd84a.firebaseapp.com/" class="navbar-item" target="_blank">Firebase-Vue-Starter</a>

      <!-- バーガーメニュー -->
      <a
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        :class="{ 'is-active': isActive }"
        @click="toggle"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <!-- 親コンポーネントから渡されたメニューを表示 -->
    <div class="navbar-menu" :class="{ 'is-active': isActive }">
      <div class="navbar-start">
        <router-link
          v-for="(item, index) in items"
          :key="index"
          :to="item.to"
          class="navbar-item"
        >{{ item.name }}</router-link>
      </div>

      <!-- サインイン -->
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link to="/signin" class="button is-primary">
              <strong>Sign in</strong>
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </nav>
</template>

<script>
export default {
  /** コンポーネント名 */
  name: "GlobalNavi",
  /** 親コンポーネントから受け取るデータ */
  props: [ 'items' ],
  /** コンポーネントに属するデータ(状態) */
  data() {
    return {
      isActive: false
    };
  },
  /** コンポーネント内で使用するメソッドを定義 */
  methods: {
    toggle() {
      this.isActive = !this.isActive;
    }
  }
};
</script>