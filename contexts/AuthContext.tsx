import React from "react";
import { useState, useEffect, useContext } from "react";
import { auth } from "../util/firebase";
import firebase from "firebase/compat";
import Router, { useRouter } from "next/router";

interface authContextInterface {
  currUser: firebase.User;
  signup: (
    email: string,
    password: string
  ) => Promise<firebase.auth.UserCredential>;
  login: (
    email: string,
    password: string
  ) => Promise<firebase.auth.UserCredential>;
  isLoggedIn: () => boolean;
  signout: () => void;
}

const AuthContext = React.createContext<Partial<authContextInterface>>({});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState<firebase.User>();
  const router = useRouter();

  function signup(email: string, password: string) {
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function isLoggedIn() {
    return currUser !== null ? true : false;
  }

  function signout() {
    auth.signOut();
    router.replace("/");
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setCurrUser(user));

    return unsubscribe;
  }, []);

  const value = {
    currUser,
    signup,
    login,
    isLoggedIn,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
