
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB27Tsqbs0nydi2b9wCv-Ct05zNkXvk2u0",
  authDomain: "all-project-7f915.firebaseapp.com",
  projectId: "all-project-7f915",
  storageBucket: "all-project-7f915.firebasestorage.app",
  messagingSenderId: "192794057278",
  appId: "1:192794057278:web:97ba6994c555e495a9cf6f"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
