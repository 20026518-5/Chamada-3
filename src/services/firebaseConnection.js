import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCKsDUmGU2B7p7fFu_-8Tpk6YACJDiD060",
  authDomain: "teste-chamada-3a923.firebaseapp.com",
  projectId: "teste-chamada-3a923",
  storageBucket: "teste-chamada-3a923.firebasestorage.app",
  messagingSenderId: "357349991534",
  appId: "1:357349991534:web:23aad0a159db2231daf27f",
  measurementId: "G-2DP1JVXZ9K"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };