import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Box,
} from "@mui/material";
import Image from "next/image";
import Router from "next/router";
import React from "react";
import styles from "../styles/adCard.module.scss";

interface CardProps {
  name: string;
  price: number;
  description?: string;
  subcategory: string;
  quantity?: number;
  images?: string[];
  priceUnit: string;
  link: string;
  search?: boolean;
  small?: boolean;
  disabled?: boolean;
  mapCard?: boolean;
}

const AdCard = (props: CardProps) => {
  const {
    name,
    description,
    price,
    images,
    quantity,
    priceUnit,
    link,
    search,
    small,
    disabled,
    mapCard,
  } = props;

  return !mapCard ? (
    <Card variant="elevation" className={styles.card} elevation={2}>
      <CardActionArea
        disableRipple
        onClick={() => {
          const path = link.split("/");
          Router.push({
            pathname: "/ad",
            query: { prov: path[1], aID: path[3] },
          });
        }}
        disabled={disabled}
      >
        <CardContent className={styles.cardContent}>
          <Box className={styles.cardImage}>
            {!!images?.length ? (
              <Image src={images[0]} layout="fill"></Image>
            ) : (
              <Image src={"/noImg.png"} layout="fill"></Image>
            )}
          </Box>
          <Box className={styles.cardInfo}>
            <h3>{name}</h3>
            <Box
              className={[
                styles.cardDetails,
                small ? styles.smallDetails : "",
              ].join(" ")}
            >
              {search || (
                <div className={styles.description}>{description}</div>
              )}
              <Box
                className={[styles.cardActions, small ? styles.small : ""].join(
                  " "
                )}
              >
                {!search ? (
                  <div>Raspolozivo:{quantity}</div>
                ) : (
                  <div>Ocena: </div>
                )}
                <div>
                  {price === -1 ? "Po dogovoru" : price} {priceUnit}
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
            const path = link.split("/");
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
              {!!images?.length ? (
                <Image src={images[0]} layout="fill"></Image>
              ) : (
                <Image src={"/noImg.png"} layout="fill"></Image>
              )}
            </Box>
            <Box className={styles.mapCardInfo}>
              <h3>{name}</h3>
              <Box
                className={[
                  styles.mapCardDetails,
                  small ? styles.smallDetails : "",
                ].join(" ")}
              >
                <div>
                  <div>
                    {price}
                    {priceUnit}
                  </div>
                </div>
                <div>***** </div>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
};

export default AdCard;
