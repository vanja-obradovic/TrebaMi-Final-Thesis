import { Box, Container } from "@mui/system";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import AuthCheck from "../components/AuthCheck";
import { useAuth } from "../contexts/AuthContext";
import { getUser, getUserAds } from "../util/firebase";
import styles from "../styles/userProfile.module.scss";
import { Avatar, Paper } from "@mui/material";
import { FiSettings } from "react-icons/fi";
import Link from "next/link";

const UserDashboard = () => {
  const { currUser } = useAuth();

  const [userProfile, setUserProfile] = useState<DocumentData>();
  const [userAds, setUserAds] =
    useState<QueryDocumentSnapshot<DocumentData>[]>();

  useEffect(() => {
    const getUserDoc = async () => {
      const userDoc = await getUser(currUser?.uid);
      setUserProfile(userDoc.data());
      const userAds = await getUserAds(currUser?.uid);
      setUserAds(userAds.docs);
    };

    getUserDoc();
  }, [currUser?.uid]);

  return (
    <AuthCheck>
      <Container component="div" maxWidth="xl" className={styles.wrapper}>
        <Box className={styles.userDetails}>
          <Paper elevation={4} className={styles.paper}>
            <Box className={styles.avatarWrapper}>
              <Avatar
                src={currUser?.photoURL}
                className={styles.avatar}
              ></Avatar>
            </Box>
            <Box>
              <div>
                <h2>
                  {currUser?.displayName}
                  <Link href="/settings">
                    <FiSettings />
                  </Link>
                </h2>
                <div className={styles.stats}>
                  <div>
                    <span>Rating:</span>
                    <span>{userProfile?.rating ?? "N/A"}</span>
                  </div>
                  <div>
                    <span>Reputation:</span>
                    <span>{userProfile?.reputation ?? "N/A"}</span>
                  </div>
                  <div>
                    <span>Membership:</span>
                    <span
                      style={
                        userProfile?.membership === "silver"
                          ? { border: "solid silver 2px" }
                          : userProfile?.membership === "gold"
                          ? { border: "solid gold 2px" }
                          : {
                              border: "solid #1caffd 2px",
                            }
                      }
                    >
                      {userProfile?.membership}
                    </span>
                  </div>
                </div>
              </div>
            </Box>
          </Paper>
        </Box>
        <Box className={styles.economy}>
          <Paper elevation={4} className={styles.paper}>
            {userAds?.map((doc, index) => {
              return <div key={index}>{JSON.stringify(doc.data())}</div>;
            })}
          </Paper>
        </Box>
      </Container>
    </AuthCheck>
  );
};

export default UserDashboard;
