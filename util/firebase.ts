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
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
  startAfter,
  endAt,
  endBefore,
  startAt,
  deleteDoc,
  documentId,
} from "firebase/firestore";
import { ngram } from "./ngram";
import { commentSchema } from "../models/Comment";
import { receiptSchema } from "../models/Receipt";
import { Chat, chatSchema } from "../models/Chat";
import { Message, messageSchema } from "../models/Message";

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

export const getUserReceipts = async (
  uid: string,
  type: "purchases" | "sales"
) => {
  const adsRef = collection(getFirestore(app), `/users/${uid}/${type}`);
  const userPurchases = await getDocs(adsRef);
  return userPurchases.docs.flatMap((doc) => {
    const docData = doc.data();
    return docData.receipts.map((receipt) => receiptSchema.cast(receipt));
  });
};

export const getUserFavourites = (arr: any) => {
  if (arr.length === 0) return new Promise<any[]>((res, rej) => res([]));
  const ref = collection(getFirestore(app), "users");
  const q = query(ref, where(documentId(), "in", arr));
  return getDocs(q).then((res) => {
    return res.docs.map((doc) => {
      return {
        uid: doc.id,
        displayName: doc.data().name + " " + doc.data().surname,
        photoURL: doc.data().photoURL,
      };
    });
  });
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
export const getAdsAdvanced = async (
  name: string,
  subcat: string,
  cat: string
) => {
  if (name === "" && subcat === "") {
    const ref = collectionGroup(getFirestore(app), `ads`);
    const refWhere = query(ref, where("category", "==", cat));
    const allAds = await getDocs(refWhere);
    return allAds;
  } else if (name === "") {
    const ref = collectionGroup(getFirestore(app), `ads`);
    const refWhere = query(ref, where("subcategory", "==", subcat));
    const allAds = await getDocs(refWhere);
    return allAds;
  } else if (subcat === "") {
    const ref = collectionGroup(getFirestore(app), `ads`);
    const refWhere = query(
      ref,
      where("provider.displayName", ">=", name),
      where("provider.displayName", "<=", name + "~"),
      where("category", "==", cat)
    );
    const allAds = await getDocs(refWhere);
    return allAds;
  } else {
    const ref = collectionGroup(getFirestore(app), `ads`);
    const refWhere = query(
      ref,
      where("provider.displayName", ">=", name),
      where("provider.displayName", "<=", name + "~"),
      where("subcategory", "==", subcat)
    );
    const allAds = await getDocs(refWhere);
    return allAds;
  }
};

export const getAdComments = async (adID: string) => {
  const ref = collectionGroup(getFirestore(app), `comments`);
  const refWhere = query(ref, where("aid", "==", adID));
  const allComments = await getDocs(refWhere);
  return allComments.docs.flatMap((doc) => {
    const docData = doc.data();
    return docData.comments.map((elem) =>
      commentSchema.cast(
        {
          ...elem,
          commenter: docData.commenter,
        },
        { stripUnknown: true }
      )
    );
  });
};

export const updateAd = (aid: string, uid: string, data) => {
  const ref = doc(getFirestore(app), `/users/${uid}/ads/${aid}`);
  return updateDoc(ref, {
    quantity: data.editQuantity,
    name: data.name,
    price: data.price,
    description: data.description,
  });
};

export const getChat = async (chatID: string) => {
  const ref = doc(getFirestore(app), `chat/${chatID}`);
  const chat = await getDoc(ref);
  return chatSchema.cast(chat.data());
};

export const newChat = async (chatDetails: Chat) => {
  const ref = collection(getFirestore(app), `chat`);
  const tmp = addDoc(ref, chatDetails);
  return tmp.then((res) => {
    updateDoc(res, {
      id: res.id,
    });
    return tmp;
  });
};

export const getUserChats = async (member) => {
  console.log(member);
  const ref = collection(getFirestore(app), `chat`);
  const refWhere = query(ref, where("members", "array-contains", member));
  const chats = await getDocs(refWhere);
  return chats.docs.map((doc) => {
    return chatSchema.cast(doc.data(), { stripUnknown: true });
  });
};

export const getChatMessages = async (chatID: string, start?: number) => {
  const ref = query(
    collection(getFirestore(app), `message/${chatID}/messages`),
    orderBy("sentAt", "desc"),
    limit(10)
  );
  const messages = await getDocs(start ? query(ref, startAfter(start)) : ref);
  console.log("Dohvatio iz backa " + messages.docs.length);
  return messages.docs.reverse().map((doc) => {
    return messageSchema.cast(doc.data(), { stripUnknown: true });
  });
};

export const sendMessage = (
  chatID: string,
  message: Message,
  senderID: string
) => {
  const ref = collection(getFirestore(app), `message/${chatID}/messages`);
  addDoc(ref, message).then(() => {
    updateDoc(doc(getFirestore(app), `chat/${chatID}`), {
      "recentMessage.messageText": message.messageText,
      "recentMessage.sentAt": message.sentAt,
      "recentMessage.sentBy": message.sentBy,
      "recentMessage.readBy": [senderID],
    });
  });
};

export const setOffer = (chatID: string, offer: number) => {
  const ref = doc(getFirestore(app), `chat/${chatID}`);
  return updateDoc(ref, {
    "offer.amount": offer,
  });
};

export const deleteAd = (aid: string, uid: string, images: string[]) => {
  const adRef = doc(getFirestore(app), `/users/${uid}/ads/${aid}`);
  return deleteDoc(adRef).then(() => {
    const storageInsance = getStorage(app);
    for (const image of images) {
      deleteObject(ref(storageInsance, image));
    }
    const userRef = doc(getFirestore(app), `/users/${uid}`);
    updateDoc(userRef, {
      "ad.count": increment(-1),
    });
  });
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
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
  startAfter,
  endAt,
  endBefore,
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
