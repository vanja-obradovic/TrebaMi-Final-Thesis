import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import { arrayUnion, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Chat, chatSchema } from "../models/Chat";
import { Message, messageSchema } from "../models/Message";
import app, {
  firestore,
  getChat,
  getChatMessages,
  sendMessage,
  setOffer,
} from "../util/firebase";
import styles from "../styles/chat.module.scss";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { format, isToday } from "date-fns";
import Link from "next/link";
import { toast } from "react-toastify";
import { Id, Toast } from "react-toastify/dist/types";

export const getServerSideProps = async ({ query }) => {
  const chatID = query.id;
  const chat = await getChat(chatID);
  const map = {};
  for (const user of chat.members) {
    map[user.uid] = {
      photoURL: user.photoURL,
      displayName: user.displayName,
    };
  }
  const messages = await getChatMessages(chatID);
  return {
    props: {
      baseChat: chat,
      messageList: messages,
      userMap: map,
    },
  };
};

const ChatPage = ({
  baseChat,
  messageList,
  userMap,
}: {
  baseChat: Chat;
  messageList: Message[];
  userMap;
}) => {
  const [rtmessages, setRtMessages] = useState<Message[]>();
  const [rtChat, setRtChat] = useState<Chat>();
  const { currUser } = useAuth();
  const toastRef = useRef<Id>();

  const messages = rtmessages || messageList;
  const chat = rtChat || baseChat;

  const offerVisible =
    (currUser?.uid === chat.createdBy &&
      chat.subject.category === "products") ||
    (currUser?.uid !== chat.createdBy && chat.subject.category === "services");

  const router = useRouter();
  const {
    handleSubmit: handleMessage,
    register: registerMessage,
    reset: resetMessage,
  } = useForm();
  const {
    handleSubmit: handleOffer,
    register: registerOffer,
    setValue: setFormOffer,
  } = useForm({
    defaultValues: { offer: chat.offer.amount === -1 ? 0 : chat.offer.amount },
  });

  const confirmOffer = () => {
    const userKeys = Object.keys(userMap);
    const buyerID = chat.createdBy;
    const sellerID = userKeys[(userKeys.indexOf(buyerID) + 1) % 2];

    const buyerRef = firestore.collection(
      firestore.getFirestore(app),
      `users/${buyerID}/purchases`
    );
    const sellerRef = firestore.collection(
      firestore.getFirestore(app),
      `users/${sellerID}/sales`
    );
    const adRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}/ads/${chat.subject.aid}`
    );

    const batch = firestore.writeBatch(firestore.getFirestore(app));
    const time = new Date().getTime();

    batch.set(
      firestore.doc(buyerRef, chat.subject.aid),
      {
        receipts: firestore.arrayUnion({
          aid: chat.subject.aid,
          adTitle: chat.subject.adTitle,
          commented: false,
          completed: true,
          amount: chat.offer.amount,
          quantity: 1,
          displayName: userMap[buyerID].displayName,
          buyerID: buyerID,
          sellerID: sellerID,
          timestamp: time,
          subcategory: chat.subject.subcategory,
        }),
      },
      { merge: true }
    );
    batch.set(
      firestore.doc(sellerRef, chat.subject.aid),
      {
        receipts: firestore.arrayUnion({
          aid: chat.subject.aid,
          adTitle: chat.subject.adTitle,
          commented: false,
          completed: true,
          amount: chat.offer.amount,
          quantity: 1,
          displayName: userMap[buyerID].displayName,
          buyerID: buyerID,
          sellerID: sellerID,
          timestamp: time,
          subcategory: chat.subject.subcategory,
        }),
      },
      { merge: true }
    );

    batch.update(
      firestore.doc(firestore.getFirestore(app), `chat/${chat.id}`),
      {
        closed: true,
      }
    );

    toast.promise(
      batch.commit().then(() => {
        toast.dismiss(toastRef.current);
      }),
      {
        pending: "U toku...",
        error: "Greska, pokusajte ponovo",
        success: "Uspeh!",
      }
    );
  };

  useEffect(() => {
    const unsub = onSnapshot(
      firestore.query(
        firestore.collection(
          firestore.getFirestore(app),
          `message/${router.query.id}/messages`
        ),
        firestore.orderBy("sentAt")
      ),
      (res) => {
        const rtMessages = res.docs.map((doc) =>
          messageSchema.cast(doc.data())
        );
        setRtMessages(rtMessages);
      }
    );

    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      firestore.doc(firestore.getFirestore(app), `chat/${router.query.id}`),
      (res) => {
        setRtChat(chatSchema.cast(res.data()));
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (currUser && !chat.closed)
      if (chat.offer.amount !== -1) {
        if (offerVisible) {
          toast.dismiss(toastRef.current);
          toastRef.current = toast.info(
            "Trenutna ponuda " + chat.offer.amount + " rsd",
            {
              autoClose: false,
              closeButton: false,
              closeOnClick: false,
              draggable: false,
              position: "top-center",
              className: styles.toastWrapper,
            }
          );
        } else {
          toast.dismiss(toastRef.current);
          toastRef.current = toast.info(
            <Box className={styles.toastContent}>
              <div>Trenutna ponuda {chat.offer.amount} rsd</div>
              <div className={styles.buttons}>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() =>
                    resetOffer("***Automatska poruka => Ponuda odbijena***")
                  }
                >
                  Odustani
                </Button>
                <Button
                  color="success"
                  variant="outlined"
                  onClick={() => confirmOffer()}
                >
                  Prihvati
                </Button>
              </div>
            </Box>,
            {
              autoClose: false,
              closeButton: false,
              closeOnClick: false,
              draggable: false,
              position: "top-center",
              className: styles.toastWrapper,
            }
          );
        }
      } else {
        toast.dismiss(toastRef.current);
      }
  }, [chat.offer.amount, currUser, offerVisible]);

  useEffect(() => {
    if (currUser && currUser.uid !== chat.recentMessage.sentBy) {
      const ref = firestore.doc(firestore.getFirestore(app), `chat/${chat.id}`);
      firestore.updateDoc(ref, {
        "recentMessage.readBy": arrayUnion(currUser.uid),
      });
    }
  }, [rtmessages]);

  const handleNewMessage = (data) => {
    sendMessage(
      chat.id,
      messageSchema.cast({
        messageText: data.message,
        sentAt: new Date().getTime(),
        sentBy: currUser.uid,
      }),
      currUser.uid
    );
    resetMessage();
  };

  const handleError = () => {};

  const handleNewOffer = (data) => {
    setOffer(chat.id, data.offer);
  };

  const resetOffer = (msg?: string) => {
    setOffer(chat.id, -1);
    setFormOffer("offer", 0);

    if (msg) handleNewMessage({ message: msg });
  };

  const handleErrorOffer = () => {};

  return (
    <Container maxWidth="xl" className={styles.chatContainer}>
      <Container maxWidth="xl" className={styles.messageContainer}>
        {messages.map((message) => {
          return (
            <Box
              className={[
                styles.messageWrapper,
                message.sentBy === currUser?.uid ? styles.right : "",
              ].join(" ")}
              key={message.sentAt}
            >
              <Link href={{ pathname: "/user", query: { id: message.sentBy } }}>
                <Tooltip
                  title={userMap[message.sentBy].displayName}
                  placement="top"
                  arrow
                  style={{ cursor: "pointer" }}
                >
                  <Avatar src={userMap[message.sentBy].photoURL}>
                    {userMap[message.sentBy].displayName.charAt(0)}
                  </Avatar>
                </Tooltip>
              </Link>
              <Paper elevation={4} className={styles.message}>
                <div>{message.messageText}</div>
                <div className={styles.time}>
                  <div>
                    {isToday(message.sentAt)
                      ? "Danas,"
                      : format(message.sentAt, "dd.MM.yyyy") + ","}
                  </div>
                  <div>{format(message.sentAt, "HH:mm")}</div>
                </div>
              </Paper>
            </Box>
          );
        })}
      </Container>
      {offerVisible && !chat.closed && (
        <Box
          component="form"
          className={styles.offer}
          onSubmit={handleOffer(handleNewOffer, handleErrorOffer)}
        >
          <TextField
            label="Ponuda"
            {...registerOffer("offer", { valueAsNumber: true })}
          ></TextField>
          {chat.offer.amount === -1 && (
            <Button color="success" variant="contained" type="submit">
              Potvrdi
            </Button>
          )}
          {chat.offer.amount !== -1 && (
            <Button
              color="error"
              variant="contained"
              type="button"
              onClick={(e) => {
                resetOffer();
              }}
            >
              Ponisti
            </Button>
          )}
        </Box>
      )}
      <Box
        component="form"
        onSubmit={handleMessage(handleNewMessage, handleError)}
      >
        <TextField
          label="Nova poruka..."
          fullWidth
          {...registerMessage("message")}
          disabled={chat.closed}
        ></TextField>
      </Box>
    </Container>
  );
};

export default ChatPage;
