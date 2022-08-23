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
  FieldValue,
  increment,
  writeBatch,
  collectionGroup,
} from "firebase/firestore";
import { ngram } from "./ngram";

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

export const getAdByRef = async (prov: string, aID: string) => {
  const docRef = doc(getFirestore(app), `users/${prov}/ads/${aID}`);
  const ad = getDoc(docRef).then((res) => {
    return res;
  });
  return ad;
};

export const getAllAds = async () => {
  const ref = collectionGroup(getFirestore(app), `ads`);
  const allAds = getDocs(ref).then((res) => {
    return res;
  });
  return allAds;
};

export const getAdsByKeyword = async (keyword: string) => {
  if (keyword === "" || keyword === undefined || keyword === null) {
    return [];
  }
  const search = ngram(keyword, 3);
  const ref = collectionGroup(getFirestore(app), `ads`);
  const refWhere = query(ref, where("keywords", "array-contains-any", search));
  const allAds = await getDocs(refWhere).then((res) => {
    return res;
  });
  console.log("vratio sa baze");
  return allAds;
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
  FieldValue,
  increment,
  getDocs,
  getDoc,
  writeBatch,
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
