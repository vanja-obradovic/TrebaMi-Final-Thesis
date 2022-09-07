import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Box,
  Rating,
} from "@mui/material";
import Image from "next/image";
import Router from "next/router";
import React from "react";
import styles from "../styles/adCard.module.scss";
import PlaceIcon from "@mui/icons-material/Place";
import { AdvertisementCard } from "../models/Advertisement";

interface CardProps {
  ad: AdvertisementCard;
  search?: boolean;
  small?: boolean;
  disabled?: boolean;
  mapCard?: boolean;
}

const AdCard = (props: CardProps) => {
  const { ad, search, small, disabled, mapCard } = props;

  return !mapCard ? (
    <Card variant="elevation" className={styles.card} elevation={4}>
      <CardActionArea
        disableRipple
        onClick={() => {
          const path = ad.link.split("/");
          Router.push({
            pathname: "/ad",
            query: { prov: path[1], aID: path[3] },
          });
        }}
        disabled={disabled}
      >
        <CardContent className={styles.cardContent}>
          <Box className={styles.cardImage}>
            {!!ad.images?.length ? (
              <Image src={ad.images[0]} layout="fill"></Image>
            ) : (
              <Image src={"/noImg.png"} layout="fill"></Image>
            )}
          </Box>
          <Box className={styles.cardInfo}>
            <span className={styles.cardTitle}>
              <h3>{ad.name}</h3>
              <Rating
                value={ad.rating}
                precision={0.5}
                readOnly
                size="small"
                classes={{ root: styles.rating }}
              />
            </span>
            <Box
              className={[
                styles.cardDetails,
                small ? styles.smallDetails : "",
              ].join(" ")}
            >
              <div className={styles.location}>
                <PlaceIcon />
                {ad.provider.location.municipality}
              </div>
              {/* {search || (
                <div className={styles.description}>{ad.description}</div>
              )} */}
              <Box
                className={[styles.cardActions, small ? styles.small : ""].join(
                  " "
                )}
              >
                {!search && <div>Raspolozivo:{ad.quantity}</div>}
                <div>
                  {ad.price === -1 ? "Po dogovoru" : ad.price} {ad.priceUnit}
                </div>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  ) : (
    <>
      <Card variant="elevation" className={styles.mapCard} elevation={2}>
        <CardActionArea
          disableRipple
          onClick={() => {
            const path = ad.link.split("/");
            Router.push({
              pathname: "/ad",
              query: { prov: path[1], aID: path[3] },
            });
          }}
          disabled={disabled}
          className={styles.mapCardAction}
        >
          <CardContent className={styles.mapCardContent}>
            <Box className={styles.cardImage}>
              {!!ad.images?.length ? (
                <Image src={ad.images[0]} layout="fill"></Image>
              ) : (
                <Image src={"/noImg.png"} layout="fill"></Image>
              )}
            </Box>
            <Box className={styles.mapCardInfo}>
              <h3>{ad.name}</h3>
              <Box
                className={[
                  styles.mapCardDetails,
                  small ? styles.smallDetails : "",
                ].join(" ")}
              >
                <Rating
                  value={ad.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  classes={{ root: styles.mapCardRating }}
                />
                <div>
                  <div>
                    {ad.price}
                    {ad.priceUnit}
                  </div>
                </div>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
};

export default AdCard;
