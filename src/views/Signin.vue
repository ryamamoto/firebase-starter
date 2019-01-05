<template>
  <div class="sign-in">
    <h1 class="title is-5">Sign in</h1>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
// @ 記号は、/src へのエイリアス
import { firebase, firestore } from "@/firebase";
// firebaseui は内部で firebase/authを使用するので必要
import "firebase/auth";
import firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

export default {
  name: "signin",
  mounted() {
    let ui = firebaseui.auth.AuthUI.getInstance();
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth());
    }

    const uiConfig = {
      signInFlow: "redirect",
      //signInSuccessUrl: '/mypage',
      // ↓
      // 認証後に実行されるコールバック関数
      callbacks: {
        signInSuccessWithAuthResult: authResult => {
          this.saveUser(authResult.user).then(() => {
            // 処理が完了したときに自前でリダイレクト処理を行う
            this.$router.push("/mypage");
          });
          // saveUserが完了するまでリダイレクトさせない
          // callbackでfalseを返すことでリダイレクトしないようにしている
          return false;
        }
      },
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          defaultCountry: "JP"
        }
      ]
    };
    ui.start("#firebaseui-auth-container", uiConfig);
  },
  methods: {
    saveUser: async function(user) {
      const userRef = firestore.collection("users").doc(user.uid);
      const userDoc = await userRef.get();
      // ログインする度に、更新日時を書き換える
      let userData = {
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }
      // 初めてサインインした時のみ登録日時を保存する
      if (!userDoc.exists) {
        // Firestoreのサーバータイムを取得
        userData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      // set: 更新
      // mergeオプションをつけると、既存データにマージされる。無いと、丸ごと上書きする
      userRef.set(userData, { merge: true });
    }
  }
};
</script>