import { Button, Paper, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import React from "react";
import { getAdByRef } from "../util/firebase";
import styles from "../styles/adDetails.module.scss";
import UserDetails from "../components/UserDetails";
import Map from "../components/Map";
import { useRouter } from "next/router";
import Image from "next/image";
import Gallery from "../components/Gallery";
import AdCard from "../components/AdCard";
import { Advertisement } from "../models/Advertisement";

export const getServerSideProps = async ({ query }) => {
  const adDoc = await getAdByRef(query.prov, query.aID);
  const ad = adDoc.data();

  console.log(ad.provider);
  return {
    props: {
      adDetails: ad,
      // : {
      //   ...ad,
      //   provider: {
      //     ...ad.provider,
      //     location: {
      //       _long: ad.provider.location._long,
      //       _lat: ad.provider.location._lat,
      //     },
      //   },
      // },
    },
  };
};

const AdDetails = ({ adDetails }: { adDetails: Advertisement }) => {
  const {
    name,
    description,
    provider,
    price,
    priceUnit,
    images,
    subcategory,
    quantity,
  } = adDetails;

  console.log(provider);

  const router = useRouter();

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Paper elevation={6} className={styles.wrapper}>
        <Box className={styles.sideInfo}>
          <Box>
            <UserDetails
              displayName={provider.displayName}
              photoURL={provider.photoURL}
              rootStyle={styles.userDetails}
              userLink={router.query.prov as string}
            ></UserDetails>
          </Box>
          <Box>
            <Map
              locationMarker={false}
              markerCords={provider.location.coords}
            ></Map>
          </Box>
        </Box>
        <Paper className={styles.adInfo} elevation={4}>
          <h1>{name}</h1>
          <Gallery images={images}></Gallery>
          <Typography variant="body1" classes={{ body1: styles.description }}>
            {description}
          </Typography>

          <Box>
            Cena:{price}
            &nbsp;
            {priceUnit}
            Kolicina: {quantity}
          </Box>
        </Paper>
      </Paper>
    </Container>
  );
};

export default AdDetails;
