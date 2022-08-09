import { Box, Container } from "@mui/system";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import AuthCheck from "../components/AuthCheck";
import { useAuth } from "../contexts/AuthContext";
import { getUser, getUserAds } from "../util/firebase";
import styles from "../styles/userProfile.module.scss";
import { Avatar, Paper, Tab, Tabs } from "@mui/material";
import { FiSettings } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import Link from "next/link";
import TabPanel from "../components/TabPanel";
import NextLinkAdapter from "../components/NextLinkAdapter";
import CustomDialog from "../components/CustomDialog";

const UserDashboard = () => {
  const { currUser } = useAuth();

  const [userProfile, setUserProfile] = useState<DocumentData>();
  const [userAds, setUserAds] =
    useState<QueryDocumentSnapshot<DocumentData>[]>();

  const [tabValue, setTabValue] = useState(0);

  const tabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const [dialog, setDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const dialogOpen = () => {
    setDialog(true);
  };
  const dialogClose = (state?: boolean) => {
    setDialog(false);
  };

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
            <Tabs
              value={tabValue}
              onChange={tabChange}
              centered
              classes={{ indicator: styles.indicator }}
              TabIndicatorProps={{ children: <span></span> }}
            >
              <Tab label="Dashboard" classes={{ root: styles.tabs }} />
              <Tab label="My ads" classes={{ root: styles.tabs }} />
              <Tab label="Messages" classes={{ root: styles.tabs }} />
              <Tab label="My purchases" classes={{ root: styles.tabs }} />
            </Tabs>
            <hr style={{ border: "1px solid #e8e8e8" }} />

            <TabPanel value={tabValue} index={0}>
              Item One
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Paper elevation={2} className={styles.actions}>
                <button onClick={() => dialogOpen()}>
                  <IoIosAdd /> {"Add item"}
                </button>
                <CustomDialog
                  title="proba"
                  contentText="Text"
                  dialogClose={dialogClose}
                  dialogOpen={dialog}
                  dialogLoading={dialogLoading}
                >
                  Hello
                </CustomDialog>
              </Paper>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              Item Three
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              Item Four
            </TabPanel>

            {/* {userAds?.map((doc, index) => {
              return <div key={index}>{JSON.stringify(doc.data())}</div>;
            })} */}
          </Paper>
        </Box>
      </Container>
    </AuthCheck>
  );
};

export default UserDashboard;
