import { Box, Card, CardActionArea, CardContent } from "@mui/material";
import { format, isToday } from "date-fns";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Chat } from "../models/Chat";
import styles from "../styles/chatCard.module.scss";

const ChatCard = (props: Chat) => {
  const { subject, id, members, createdBy, recentMessage } = props;
  const [seller, setSeller] = useState<{ uid: string; displayName: string }>();
  const [buyer, setBuyer] = useState<{ uid: string; displayName: string }>();
  const [isRead, setRead] = useState(false);

  useEffect(() => {
    for (const member of members) {
      if (member.uid !== createdBy)
        setSeller({ uid: member.uid, displayName: member.displayName });
      else setBuyer({ uid: member.uid, displayName: member.displayName });
    }
    if (currUser) setRead(recentMessage.readBy.indexOf(currUser.uid) >= 0);
  }, []);

  const router = useRouter();
  const { currUser } = useAuth();

  return (
    <Card variant="elevation" className={styles.card} elevation={2}>
      <CardActionArea
        disableRipple
        onClick={() => {
          router.push({ pathname: "chat", query: { id: id } });
        }}
      >
        <CardContent
          className={[styles.cardContent, !isRead ? styles.pending : ""].join(
            " "
          )}
        >
          <Box className={styles.cardInfo}>
            <span className={styles.cardTitle}>
              <h3>
                {createdBy === currUser?.uid
                  ? seller?.displayName
                  : buyer?.displayName}
                &nbsp; ({subject.adTitle})
              </h3>
            </span>
            {recentMessage.sentAt && (
              <Box className={styles.cardDetails}>
                <div>{recentMessage.messageText}</div>
                <div className={styles.time}>
                  <div>
                    {isToday(recentMessage.sentAt)
                      ? ""
                      : format(recentMessage.sentAt, "dd.MM.yyyy") + ","}
                  </div>
                  <div>{format(recentMessage.sentAt, "HH:mm")}</div>
                </div>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ChatCard;
