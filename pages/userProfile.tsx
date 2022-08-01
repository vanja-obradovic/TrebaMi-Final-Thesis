import { DocumentData } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUser } from "../util/firebase";

const UserDashboard = () => {
  const { currUser } = useAuth();

  const [userProfile, setUserProfile] = useState<DocumentData>();

  useEffect(() => {
    const getUserDoc = async () => {
      const userDoc = await getUser(currUser?.uid);
      setUserProfile(userDoc.data());
    };
    getUserDoc();
  }, [currUser?.uid]);

  return (
    <>
      {currUser?.photoURL}
      <div>{JSON.stringify(userProfile)}</div>
    </>
  );
};

export default UserDashboard;
