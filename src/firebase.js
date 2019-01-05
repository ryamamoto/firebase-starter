import firebase from 'firebase/app'
import 'firebase/firestore'

// Firebase
const config = {
  apiKey:            process.env.VUE_APP_API_KEY,
  authDomain:        process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL:       process.env.VUE_APP_DB_URL,
  projectId:         process.env.VUE_APP_PROJECT_ID,
  storageBucket:     process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID
}
firebase.initializeApp(config)

// FireStore
const settings = {
  // これを指定しないと警告が表示される
  timestampsInSnapshots: true,
}
const firestore = firebase.firestore()
firestore.settings(settings)

export { firebase, firestore }