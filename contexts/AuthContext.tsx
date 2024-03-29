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
    if (currUser === null) return false;
    else if (currUser !== undefined) return true;
  }

  function signout() {
    router.replace("/");
    authInstance.signOut();
  }

  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged((user) =>
      setCurrUser(user)
    );

    return unsubscribe;

    //!nookies version
    // const unsubscribe = authInstance.onIdTokenChanged(async (user) => {
    //   if (!user) {
    //     setCurrUser(null);
    //     setCookie(undefined, "userToken", "", {});
    //     return;
    //   }
    //   const userToken = await user.getIdToken();
    //   setCurrUser(user);
    //   setCookie(undefined, "userToken", userToken, {});
    // });
    // return unsubscribe;
  }, [authInstance]);

  const value = {
    currUser,
    signup,
    login,
    isLoggedIn,
    signout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
