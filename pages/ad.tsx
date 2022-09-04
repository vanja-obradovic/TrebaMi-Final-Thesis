import { Button, Paper, Rating, TextField, Typography } from "@mui/material";
import { Box, Container } from "@mui/system";
import React, { useEffect, useState } from "react";
import app, {
  firestore,
  getAdByRef,
  getAdComments,
  newChat,
} from "../util/firebase";
import styles from "../styles/adDetails.module.scss";
import UserDetails from "../components/UserDetails";
import Map from "../components/Map";
import { useRouter } from "next/router";
import Image from "next/image";
import Gallery from "../components/Gallery";
import AdCard from "../components/AdCard";
import { adSchema, Advertisement } from "../models/Advertisement";
import { Comment } from "../models/Comment";
import AdComment from "../components/AdComment";
import { compareDesc } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { onSnapshot, serverTimestamp } from "firebase/firestore";

export const getServerSideProps = async ({ query }) => {
  const adDoc = await getAdByRef(query.prov, query.aID);
  const ad = adSchema.cast(adDoc.data());
  const comments = await getAdComments(query.aID as string);
  return {
    props: {
      adDetails: ad,
      comments: comments.sort((a, b) => b.timestamp - a.timestamp),
    },
  };
};

type FormData = {
  quantity: number;
};

const AdDetails = ({
  adDetails,
  comments,
}: {
  adDetails: Advertisement;
  comments: Comment[];
}) => {
  // const {
  //   name,
  //   description,
  //   provider,
  //   price,
  //   priceUnit,
  //   images,
  //   category,
  //   quantity,
  //   rating,
  //   pendingUsers,
  // } = adDetails;

  const { currUser } = useAuth();

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { quantity: 1 } });

  const [rtAD, setRtAD] = useState<Advertisement>();

  const handlePurchase = (formdata: FormData) => {
    const buyerRef = firestore.collection(
      firestore.getFirestore(app),
      `users/${currUser.uid}/purchases`
    );
    const sellerRef = firestore.collection(
      firestore.getFirestore(app),
      `users/${router.query.prov as string}/sales`
    );
    const adRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${router.query.prov as string}/ads/${router.query.aID as string}`
    );

    const batch = firestore.writeBatch(firestore.getFirestore(app));
    const time = new Date().getTime();

    batch.set(
      firestore.doc(buyerRef, router.query.aID as string),
      {
        receipts: firestore.arrayUnion({
          aid: router.query.aID as string,
          adTitle: ad.name,
          commented: false,
          completed: false,
          amount: ad.price,
          quantity: formdata.quantity,
          displayName: currUser.displayName,
          buyerID: currUser.uid,
          sellerID: router.query.prov as string,
          timestamp: time,
          subcategory: ad.subcategory,
        }),
        // spent: firestore.increment(price * data.quantity),
      },
      { merge: true }
    );
    batch.set(
      firestore.doc(sellerRef, router.query.aID as string),
      {
        // profit: firestore.increment(price*),
        receipts: firestore.arrayUnion({
          aid: router.query.aID as string,
          adTitle: ad.name,
          commented: false,
          completed: false,
          amount: ad.price,
          quantity: formdata.quantity,
          displayName: currUser.displayName,
          buyerID: currUser.uid,
          sellerID: router.query.prov as string,
          timestamp: time,
          subcategory: ad.subcategory,
        }),
      },
      { merge: true }
    );

    batch.update(adRef, {
      quantity: firestore.increment(-formdata.quantity),
      pendingUsers: firestore.arrayUnion(currUser.uid),
    });

    toast.promise(batch.commit(), {
      pending: "U toku...",
      error: "Greska, pokusajte ponovo",
      success: "Uspeh!",
    });
  };
  const handleErrors = (err) => {
    if (err.quantity) toast.error(err.quantity.message);
  };

  useEffect(() => {
    const unsub = onSnapshot(
      firestore.doc(
        firestore.getFirestore(app),
        `/users/${router.query.prov as string}/ads/${router.query.aID}`
      ),
      (data) => setRtAD(adSchema.cast(data.data()))
    );

    return unsub;
  }, []);

  const startChat = () => {
    const time = new Date().getTime();
    const members = [
      {
        displayName: currUser.displayName,
        uid: currUser.uid,
        photoURL: currUser.photoURL,
      },
      {
        displayName: ad.provider.displayName,
        uid: router.query.prov as string,
        photoURL: ad.provider.photoURL,
      },
    ];
    newChat({
      closed: false,
      createdAt: time,
      createdBy: currUser?.uid,
      id: router.query.aID as string,
      modifiedAt: time,
      members: members,
      offer: {
        amount: -1,
        // isAccepted: false, isRejected: false
      },
      recentMessage: {
        messageText: null,
        readBy: [],
        sentAt: null,
        sentBy: null,
      },
      subject: {
        adTitle: ad.name,
        aid: router.query.aID as string,
        category: ad.category,
        subcategory: ad.subcategory,
      },
    }).then(() =>
      router.push({
        pathname: "chat",
        query: { id: router.query.aID as string },
      })
    );
  };

  const ad = rtAD || adDetails;

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Paper elevation={6} className={styles.wrapper}>
        <Box className={styles.sideInfo}>
          <Box>
            <UserDetails
              displayName={ad.provider.displayName}
              photoURL={ad.provider.photoURL}
              rootStyle={styles.userDetails}
              userLink={router.query.prov as string}
            ></UserDetails>
          </Box>
          <Box>
            <Map
              locationMarker={false}
              markerCords={ad.provider.location.coords}
            ></Map>
          </Box>
        </Box>
        <Paper className={styles.adInfo} elevation={4}>
          <span className={styles.adTitle}>
            <h1>{ad.name}</h1>{" "}
            <Rating
              value={ad.rating}
              precision={0.5}
              readOnly
              size="medium"
              classes={{ root: styles.rating }}
            />
          </span>
          <Gallery images={ad.images}></Gallery>
          <Paper className={styles.actionWrapper} elevation={4}>
            <Box className={styles.actionInfo}>
              <h4>Cena:</h4>
              <div>
                {ad.price === -1 ? "Po dogovoru" : ad.price}
                {ad.priceUnit}
              </div>
            </Box>
            <Box
              component="form"
              className={styles.action}
              onSubmit={handleSubmit(handlePurchase, handleErrors)}
            >
              {ad.category === "products" && (
                <div className={styles.actionInput}>
                  <div className={styles.actionInputLegend}>
                    {ad.category === "products" &&
                      `Raspolozivo: ${ad.quantity}`}
                  </div>
                  <TextField
                    label="Kolicina"
                    size="small"
                    {...register("quantity", {
                      required: "Morate uneti kolicinu!",
                      min: {
                        value: 1,
                        message: "Kolicina mora biti pozitivna!",
                      },
                      max: {
                        value: ad.quantity,
                        message: "Uneta kolicina je veca od raspolozive!",
                      },
                      valueAsNumber: true,
                    })}
                    type="number"
                    error={!!errors.quantity}
                  />
                </div>
              )}
              {ad.pendingUsers.includes(currUser?.uid) &&
                "Poslednja kupovina nije potvrdjena"}
              <div className={styles.actionButtons}>
                {ad.category === "products" && (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={
                      !!errors.quantity ||
                      ad.pendingUsers.includes(currUser?.uid)
                    }
                  >
                    Kupi
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  type="button"
                  onClick={(e) => {
                    startChat();
                  }}
                  disabled={
                    !!errors.quantity || ad.pendingUsers.includes(currUser?.uid)
                  }
                >
                  Pregovaraj
                </Button>
              </div>
            </Box>
          </Paper>
          <Typography variant="body1" classes={{ body1: styles.description }}>
            {ad.description}
          </Typography>
          {comments.map((item, index) => {
            return <AdComment {...item} key={index}></AdComment>;
          })}
        </Paper>
      </Paper>
    </Container>
  );
};

export default AdDetails;
