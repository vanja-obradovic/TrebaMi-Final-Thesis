import { Box, Container, Paper } from "@mui/material";
import React from "react";
import AdCard from "../components/AdCard";
import UserDetails from "../components/UserDetails";
import { adSchema, Advertisement } from "../models/Advertisement";
import { getUser, getUserAds } from "../util/firebase";
import styles from "../styles/user.module.scss";
import { User, userSchema } from "../models/User";

export const getServerSideProps = async ({ query, res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  const userAds = await getUserAds(query.id).then((res) => {
    return res.docs.map((ad, index) => {
      const temp = adSchema.cast(ad.data(), { stripUnknown: true });
      return {
        ...temp,
        link: ad.ref.path,
      };
    });
  });

  const user = await getUser(query.id).then((res) => {
    if (res.data() === undefined) return undefined;
    else return userSchema.cast(res.data());
  });
  if (user === undefined)
    return {
      notFound: true,
    };
  return {
    props: {
      userAds: userAds,
      userDetails: {
        membership: user.membership,
        reputation: user.reputation,
        rating: user.rating,
      },
    },
  };
};

const User = ({
  userAds,
  userDetails,
}: {
  userAds: Advertisement[];
  userDetails: Partial<User>;
}) => {
  return (
    <Container component="div" maxWidth="xl" className={styles.container}>
      <Paper elevation={4} className={styles.wrapper}>
        <UserDetails
          displayName={userAds[0].provider.displayName}
          membership={userDetails.membership}
          photoURL={userAds[0].provider.photoURL}
          rating={userDetails.rating}
          reputation={userDetails.reputation}
        ></UserDetails>
        <Box className={styles.cardWrapper}>
          {userAds.map((val, index) => {
            return <AdCard ad={val} key={index}></AdCard>;
          })}
        </Box>
      </Paper>
    </Container>
    // <div>
    //   User
    //   {userAds.map((val, index) => {
    //     return <AdCard ad={val} key={index}></AdCard>;
    //   })}
    // </div>
  );
};

export default User;
