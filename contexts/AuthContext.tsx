import React from "react";
import { useState, useEffect, useContext } from "react";
import app, { auth } from "../util/firebase";
import { UserCredential, User } from "firebase/auth";
import { useRouter } from "next/router";

interface authContextInterface {
  currUser: User;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  isLoggedIn: () => boolean;
  signout: () => void;
}

const AuthContext = React.createContext<Partial<authContextInterface>>({});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currUser, setCurrUser] = useState<User>();
  const router = useRouter();
  const authInstance = auth.getAuth(app);

  function signup(email: string, password: string) {
    return auth.createUserWithEmailAndPassword(authInstance, email, password);
  }

  function login(email: string, password: string) {
    return auth.signInWithEmailAndPassword(authInstance, email, password);
  }

  function isLoggedIn() {
    return currUser !== null ? true : false;
  }

  function signout() {
    authInstance.signOut();
    router.replace("/");
  }

  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged((user) =>
      setCurrUser(user)
    );

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
