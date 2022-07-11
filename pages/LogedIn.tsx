import React, { useEffect } from "react";
import { auth } from "../util/firebase";
import firebase from "../util/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

const LogedIn = () => {
  const { currUser, signout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currUser?.displayName === null) router.replace("/setup");
  }, [currUser, router]);

  return (
    <div>
      {JSON.stringify(currUser)}
      <button onClick={signout}>Izloguj se</button>
    </div>
  );
};

export default LogedIn;
