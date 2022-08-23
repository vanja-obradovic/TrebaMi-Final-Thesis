import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Box,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import styles from "../styles/adCard.module.scss";

interface CardProps {
  name: string;
  price: string;
  description: string;
  subcategory: string;
  quantity?: number;
  images?: string[];
  priceUnit: string;
  link: string;
  search?: boolean;
  small?: boolean;
}

const AdCard = (props: CardProps) => {
  const {
    name,
    description,
    price,
    subcategory,
    images,
    quantity,
    priceUnit,
    link,
    search,
    small,
  } = props;

  const router = useRouter();

  return (
    <>
      <Card variant="elevation" className={styles.card} elevation={2}>
        <CardActionArea
          disableRipple
          onClick={() => {
            const path = link.split("/");
            router.push({
              pathname: "/ad",
              query: { prov: path[1], aID: path[3] },
            });
          }}
        >
          {/* <CardHeader
            title={name}
            classes={{ title: small ? styles.smallTitle : "" }}
          ></CardHeader> */}
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
                  className={[
                    styles.cardActions,
                    small ? styles.small : "",
                  ].join(" ")}
                >
                  {!search ? (
                    <div>Raspolozivo:{quantity}</div>
                  ) : (
                    <div>Ocena: </div>
                  )}
                  <div>
                    Cena: {price} {priceUnit}
                  </div>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
};

export default AdCard;
