import { Box, Container, Paper } from "@mui/material";
import React from "react";
import AdCard from "../components/AdCard";
import UserDetails from "../components/UserDetails";
import { adSchema, Advertisement } from "../models/Advertisement";
import { getUser, getUserAds } from "../util/firebase";
import styles from "../styles/user.module.scss";
import { User, userSchema } from "../models/User";
import AuthCheck from "../components/AuthCheck";

export const getServerSideProps = async ({ query, res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=89"
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
  if (user === undefined || !user.isProvider)
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
        number: user.number,
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
    <AuthCheck>
      <Container component="div" maxWidth="xl" className={styles.container}>
        <Paper elevation={4} className={styles.wrapper}>
          <UserDetails
            displayName={userAds[0].provider.displayName}
            membership={userDetails.membership}
            photoURL={userAds[0].provider.photoURL}
            rating={userDetails.rating}
            reputation={userDetails.reputation}
            number={userDetails.number}
          ></UserDetails>
          <Box className={styles.cardWrapper}>
            {userAds.map((val, index) => {
              return <AdCard ad={val} key={index}></AdCard>;
            })}
          </Box>
        </Paper>
      </Container>
    </AuthCheck>
    // <div>
    //   User
    //   {userAds.map((val, index) => {
    //     return <AdCard ad={val} key={index}></AdCard>;
    //   })}
    // </div>
  );
};

export default User;
