import {
  Avatar,
  Paper,
  Box,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { FiSettings } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/userDetails.module.scss";

interface userDetailsProps {
  photoURL: string;
  displayName: string;
  rating?: number;
  reputation?: number;
  membership?: string;
  rootStyle?: string;
  userLink?: string;
}

const UserDetails = (props: userDetailsProps) => {
  const {
    photoURL,
    displayName,
    rating,
    reputation,
    membership,
    rootStyle,
    userLink,
  } = props;

  const router = useRouter();
  const { currUser } = useAuth();

  const dashboard =
    (rating !== undefined ||
      reputation !== undefined ||
      membership !== undefined) &&
    userLink === undefined;
  return (
    <Card
      className={rootStyle ?? styles.userDetails}
      variant="elevation"
      elevation={4}
    >
      <CardActionArea
        disabled={dashboard}
        onClick={() => {
          router.push(
            currUser?.uid === userLink
              ? { pathname: "/profile" }
              : { pathname: "/user", query: { id: userLink } }
          );
        }}
      >
        <CardContent>
          <Box className={styles.avatarWrapper}>
            <Avatar src={photoURL} className={styles.avatar}></Avatar>
          </Box>
          <Box>
            <h2>{displayName}</h2>
            {dashboard && (
              <div className={styles.stats}>
                <div>
                  <span>Rating:</span>
                  <span>{rating ?? "N/A"}</span>
                </div>
                <div>
                  <span>Reputation:</span>
                  <span>{reputation ?? "N/A"}</span>
                </div>
                <div>
                  <span>Membership:</span>
                  <span
                    style={
                      membership === "silver"
                        ? { border: "solid silver 2px" }
                        : membership === "gold"
                        ? { border: "solid gold 2px" }
                        : {
                            border: "solid #1caffd 2px",
                          }
                    }
                  >
                    {membership}
                  </span>
                </div>
              </div>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default UserDetails;
