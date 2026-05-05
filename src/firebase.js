import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuKMeFDWyNrXYgjYx_oEfRemcZV6hjC9c",
  authDomain: "the-shop-cb1bb.firebaseapp.com",
  projectId: "the-shop-cb1bb",
  storageBucket: "the-shop-cb1bb.firebasestorage.app",
  messagingSenderId: "130173669227",
  appId: "1:130173669227:web:aa47cc4f97d312c7f1462e",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();