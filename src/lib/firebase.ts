import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAu0K3dhjgIRqmG96QxPFZ5CleD4pL6PwY",
  authDomain: "mystudyarc-bc892.firebaseapp.com",
  projectId: "mystudyarc-bc892",
  storageBucket: "mystudyarc-bc892.firebasestorage.app",
  messagingSenderId: "513668189521",
  appId: "1:513668189521:web:abcd1619fc95d380341770"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
