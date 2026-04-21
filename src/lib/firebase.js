import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAE7LHZlMmeN4KBnfxOhnslZb4fIFd3kJQ",
  authDomain: "gympass-a7083.firebaseapp.com",
  projectId: "gympass-a7083",
  storageBucket: "gympass-a7083.firebasestorage.app",
  messagingSenderId: "255106551660",
  appId: "1:255106551660:web:3b941190c198bea5776d49"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
