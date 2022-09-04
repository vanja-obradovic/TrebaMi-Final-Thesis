import { Avatar, Box, Paper, Rating } from "@mui/material";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import styles from "../styles/comment.module.scss";

interface CommentProps {
  comment: string;
  timestamp: number;
  title: string;
  rating: number;
  commenter: {
    displayName: string;
    photoURL: string;
    uid: string;
  };
}

const AdComment = (props: CommentProps) => {
  const { comment, commenter, rating, timestamp, title } = props;
  console.log(props);
  return (
    <Paper className={styles.commentWrapper} elevation={2}>
      <span className={styles.commenter}>
        <Avatar src={commenter.photoURL}>
          {commenter.displayName.charAt(0)}
        </Avatar>
        <Link href={{ pathname: "/user", query: { id: commenter.uid } }}>
          {commenter.displayName}
        </Link>
      </span>
      <Box className={styles.commentHeader}>
        <h3>{title}</h3>
        <Rating
          value={rating}
          precision={0.5}
          readOnly
          size="small"
          classes={{ root: styles.rating }}
        />
      </Box>
      <Box className={styles.commentText}>{comment}</Box>
      <span className={styles.commentTimestamp}>
        {format(timestamp, "dd-MM-yyyy")}
      </span>
    </Paper>
  );
};

export default AdComment;
