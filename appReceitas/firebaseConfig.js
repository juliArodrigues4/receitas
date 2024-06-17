import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBgQGiYMKoM9Ns7Yl1BXcDvzLWzExPJ5E",
  authDomain: "receitas-c3659.firebaseapp.com",
  projectId: "receitas-c3659",
  storageBucket: "receitas-c3659.appspot.com",
  messagingSenderId: "501108846832",
  appId: "1:501108846832:web:082d6cf19db2d7e6031235"
};
 
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const fire = getFirestore(app);