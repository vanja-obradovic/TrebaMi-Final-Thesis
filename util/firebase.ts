import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  getStorage,
  uploadBytesResumable,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  serverTimestamp,
  where,
  getDoc,
  query,
} from "firebase/firestore";

const fbConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const getUser = async (uid: string) => {
  const usersRef = doc(getFirestore(app), `/users/${uid}`);
  const userDoc = getDoc(usersRef).then((res) => {
    return res;
  });
  return userDoc;
};

const app = !getApps().length ? initializeApp(fbConfig) : getApps()[0];
export const auth = {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
};
export const firestore = {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
};
export const storage = {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable,
};
export default app;
