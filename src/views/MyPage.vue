<template>
  <div class="my-page">
    <div class="container">
      <div class="greeting">
        <h1 class="title is-6">Hello, {{ displayName }}.</h1>
      </div>
      <div class="field">
        <label class="label">Image</label>
        <div class="control">
          <div class="file has-name">
            <label class="file-label">
              <input
                class="file-input"
                type="file"
                name="file"
                accept="image/*"
                @change="selectFile"
              >
              <span class="file-cta">
                <span class="file-label">Choose</span>
              </span>
              <span class="file-name">{{ selectedImageFileName }}</span>
            </label>
          </div>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <button class="button is-link" @click="saveImage">Save Image</button>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <img :src="imageUrl" class="image">
        </div>
      </div>
      <div class="field">
        <label class="label">Profile</label>
        <div class="control">
          <textarea class="textarea" placeholder="Enter your profile" v-model="profile"></textarea>
        </div>
      </div>
      <div class="field">
        <label class="label">Preview</label>
        <div class="control">
          <div v-html="sanitizedProfile" class="preview">
            <!-- v-html:入力値をHTMLとして表示 -->
          </div>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <button class="button is-link" @click="saveProfile">Save Profile</button>
        </div>
      </div>
      <button class="button is-primary" @click="signOut">
        <strong>Sign out</strong>
      </button>
    </div>
  </div>
</template>

<script>
import { firebase, firestore } from "@/firebase";
// Cloud FunctionsのSDKをインポート
import "firebase/functions";
// ユーティリティをインポート
import _ from "lodash";
import "firebase/storage";

export default {
  data: function() {
    return {
      profile: "",
      sanitizedProfile: "",
      debouncedSanitize: null,
      selectedFile: null,
      imageUrl: ""
    };
  },
  methods: {
    signOut: function() {
      this.$store.dispatch("signOut");
      this.$router.push("/");
    },
    saveProfile: function() {
      firestore
        .collection("users")
        .doc(this.$store.getters.user.uid)
        .update({
          profile: this.profile,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          alert("Document successfully updated!");
        });
    },
    updateSanitizedProfile: async function() {
      // Functions の sanitize関数 を呼び出し
      const sanitizeFunc = firebase.functions().httpsCallable("sanitize");
      // profileのサニタイズ結果を取得
      const response = await sanitizeFunc({ text: this.profile });
      this.sanitizedProfile = response.data.sanitizedText;
    },
    // 画像を選択した際
    selectFile: function(e) {
      e.preventDefault();
      this.selectedFile = e.target.files[0];
    },
    saveImage: function() {
      // バケットのルートの参照を取得
      const storageRef = firebase.storage().ref();
      // アップロードするファイルの参照を生成
      const imageRef = storageRef.child(
        `${this.$store.getters.user.uid}/${this.selectedImageFileName}`
      );
      if (this.selectedFile) {
        // 参照を生成したら、put関数でファイルをアップロード
        imageRef.put(this.selectedFile).then(snapshot => {
          // アップロードが完了したら、snapshot.ref.getDownloadURL()で画像のURLを取得
          snapshot.ref.getDownloadURL().then(downloadURL => {
            this.imageUrl = downloadURL;
            firestore
              .collection("users")
              .doc(this.$store.getters.user.uid)
              .update({
                imageUrl: downloadURL,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
          });
        });
      }
    }
  },
  // computed は、関数として定義するが、プロパティのように使用できる
  // computed は、プロパティなので、getter/setter が使える
  // computed は、結果がキャシュされるが、method は、キャッシュされない
  computed: {
    displayName() {
      return this.$store.getters.user.displayName || "Nameless";
    },
    selectedImageFileName() {
      if (this.selectedFile) {
        return this.selectedFile.name;
      }
      return "...";
    }
  },
  created: function() {
    // プレビューを入力してから、500ミリ秒間未入力の状態が続いたら、updateSanitizedProfile 関数が呼ばれる
    this.debouncedSanitize = _.debounce(this.updateSanitizedProfile, 500);

    // Firestoreから値を取得してセット
    firestore
      .collection("users")
      .doc(this.$store.getters.user.uid)
      .get()
      .then(doc => {
        const userData = doc.data();
        if (doc && userData) {
          this.profile = userData.profile;
          this.imageUrl = userData.imageUrl;
        }
      });
  },
  // dataの更新を監視し、変更時に呼び出されるメソッドを定義
  watch: {
    // data のプロパティに変更があった場合は watch の同名メソッドが自動的に実行される
    profile() {
      // createdで定義した関数を呼び出し
      this.debouncedSanitize();
    }
  }
};
</script>

<style scoped>
.greeting {
  text-align: center;
}
.preview {
  height: 300px;
  overflow: scroll;
  border: solid 1px #aaa;
  border-radius: 3px;
  padding: 10px;
}
.image {
  max-width: 300px;
  max-height: 300px;
}
</style>