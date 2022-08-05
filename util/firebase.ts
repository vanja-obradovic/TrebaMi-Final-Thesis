import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
} from "firebase/auth";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  getStorage,
  uploadBytesResumable,
  deleteObject,
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
  getDocs,
  query,
  updateDoc,
  GeoPoint,
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

export const getUserAds = async (uid: string) => {
  const adsRef = collection(getFirestore(app), `/users/${uid}/ads`);
  const userAds = getDocs(adsRef).then((res) => {
    return res;
  });
  return userAds;
};

const app = !getApps().length ? initializeApp(fbConfig) : getApps()[0];
export const auth = {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
};
export const firestore = {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
  where,
  query,
  GeoPoint,
};
export const storage = {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  uploadBytesResumable,
  deleteObject,
};
export default app;
