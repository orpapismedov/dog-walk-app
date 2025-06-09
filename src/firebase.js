

// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3lvriizVrx1oBYvkS25LBC0TxDllQ3I4",
  authDomain: "dog-walk-tracker-949d5.firebaseapp.com",
  projectId: "dog-walk-tracker-949d5",
  storageBucket: "dog-walk-tracker-949d5.appspot.com",
  messagingSenderId: "173203045543",
  appId: "1:173203045543:web:6f4607b07f9e1278482f82",
  measurementId: "G-0FW08TN1MW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
