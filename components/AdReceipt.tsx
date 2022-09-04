import { Box, Button, Paper, Rating, TextField } from "@mui/material";
import { format } from "date-fns";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { Receipt } from "../models/Receipt";
import styles from "../styles/adReceipt.module.scss";
import app, { firestore } from "../util/firebase";
import CustomDialog from "./CustomDialog";

type CommentData = {
  comment: string;
  rating: number;
  title: string;
};

const AdReceipt = ({
  props,
  type,
  refetch,
}: {
  props: Receipt;
  type: "purchases" | "sales";
  refetch: () => void;
}) => {
  const {
    amount,
    quantity,
    timestamp,
    adTitle,
    aid,
    commented,
    completed,
    sellerID,
    buyerID,
    displayName,
  } = props;

  const { currUser } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<CommentData>({
    defaultValues: { rating: null },
    shouldUnregister: true,
    mode: "onBlur",
  });
  const [commentDialog, setCommentDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitbtn = useRef<HTMLButtonElement>();

  const handleAbort = () => {
    setLoading(true);
    const buyerRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${buyerID}/purchases/${aid}`
    );
    const sellerRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}/sales/${aid}`
    );
    const adRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}/ads/${aid}`
    );

    const batch = firestore.writeBatch(firestore.getFirestore(app));

    batch.update(buyerRef, {
      receipts: firestore.arrayRemove({ ...props }),
    });
    batch.update(sellerRef, {
      receipts: firestore.arrayRemove({ ...props }),
    });
    batch.update(adRef, {
      pendingUsers: firestore.arrayRemove(buyerID),
      quantity: firestore.increment(quantity),
    });

    toast.promise(
      batch
        .commit()
        .then(() => refetch())
        .catch(() => setLoading(false)),
      {
        pending: "U toku...",
        error: "Greska, pokusajte ponovo",
        success: "Uspeh!",
      }
    );
  };

  const handleDialogClose = (state) => {
    if (state === true) {
      submitbtn.current.click();
      if (isValid) setCommentDialog(false);
    } else setCommentDialog(false);
  };

  const handleCommentForm = (data: CommentData) => {
    setLoading(true);
    const commentRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${buyerID}/comments/${aid}`
    );
    const buyerRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${buyerID}/purchases/${aid}`
    );
    const sellerRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}/sales/${aid}`
    );
    const batch = firestore.writeBatch(firestore.getFirestore(app));
    batch.update(buyerRef, {
      receipts: firestore.arrayRemove({ ...props }),
    });
    batch.update(buyerRef, {
      receipts: firestore.arrayUnion({ ...props, commented: true }),
    });
    batch.update(sellerRef, {
      receipts: firestore.arrayRemove({ ...props }),
    });
    batch.update(sellerRef, {
      receipts: firestore.arrayUnion({ ...props, commented: true }),
    });
    batch.set(
      commentRef,
      {
        aid: aid,
        commenter: {
          displayName: displayName,
          photoURL: currUser.photoURL,
          uid: buyerID,
        },
        comments: firestore.arrayUnion({
          comment: data.comment,
          rating: +data.rating,
          timestamp: new Date().getTime(),
          title: data.title,
        }),
      },
      { merge: true }
    );
    toast.promise(
      batch
        .commit()
        .then(() => refetch())
        .catch(() => setLoading(false)),
      {
        pending: "U toku...",
        error: "Greska, pokusajte ponovo",
        success: "Uspeh!",
      }
    );
  };
  const handleCommentErr = (err) => {
    if (err.title) toast.error(err.title.message);
    if (err.rating) toast.error(err.rating.message);
  };

  const handleConfirm = () => {
    setLoading(true);
    const buyerRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${buyerID}/purchases/${aid}`
    );
    const sellerRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}/sales/${aid}`
    );
    const adRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}/ads/${aid}`
    );

    const batch = firestore.writeBatch(firestore.getFirestore(app));
    batch.update(buyerRef, {
      receipts: firestore.arrayRemove({ ...props }),
      spent: firestore.increment(amount * quantity),
    });
    batch.update(buyerRef, {
      receipts: firestore.arrayUnion({ ...props, completed: true }),
    });
    batch.update(sellerRef, {
      receipts: firestore.arrayRemove({ ...props }),
      profit: firestore.increment(amount * quantity),
    });
    batch.update(sellerRef, {
      receipts: firestore.arrayUnion({ ...props, completed: true }),
    });
    batch.update(adRef, {
      pendingUsers: firestore.arrayRemove(buyerID),
    });

    toast.promise(
      batch
        .commit()
        .then(() => refetch())
        .catch(() => setLoading(false)),
      {
        pending: "U toku...",
        error: "Greska, pokusajte ponovo",
        success: "Uspeh!",
      }
    );
  };

  return (
    <Paper className={styles.receiptWrapper}>
      <Box className={styles.receipt}>
        <h2>
          <Link href={{ pathname: "/ad", query: { prov: sellerID, aID: aid } }}>
            {adTitle}
          </Link>
        </h2>
        <div className={styles.receiptDetails}>
          <span>{`Cena: ${amount} rsd`}</span>
          <span>Kolicina: {quantity}</span>
        </div>

        <div className={styles.receiptSum}>{`Ukupna cena: ${
          amount * quantity
        } rsd`}</div>
        <div className={styles.receiptTime}>
          {format(timestamp, "dd-MM-yyyy")}
        </div>
      </Box>
      <Box className={styles.actions}>
        {!completed && (
          <Button
            variant="contained"
            color="error"
            onClick={handleAbort}
            disabled={loading}
          >
            Odustani
          </Button>
        )}
        {type === "purchases" && completed && !commented && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setCommentDialog(true)}
            disabled={loading}
          >
            Ostavi komentar
          </Button>
        )}
        {type === "sales" && !completed && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleConfirm}
            disabled={loading}
          >
            Potvrdi prodaju
          </Button>
        )}
      </Box>
      <CustomDialog
        dialogOpen={commentDialog}
        dialogClose={handleDialogClose}
        title="Ostavite komentar"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(handleCommentForm, handleCommentErr)}
          className={styles.commentForm}
        >
          <TextField
            label="Naslov"
            {...register("title", { required: "Naslov ne moze biti prazan!" })}
          ></TextField>
          <Box className={styles.commentRating}>
            <span>Ocena: </span>
            <Controller
              control={control}
              name="rating"
              rules={{ required: "Ocena ne moze biti prazna!" }}
              render={({ field: props }) => (
                <Rating
                  size="medium"
                  precision={0.5}
                  {...props}
                  value={+props.value}
                ></Rating>
              )}
            />
          </Box>
          <TextField
            label="Komentar"
            multiline
            minRows={4}
            {...register("comment")}
          ></TextField>
          <button hidden ref={submitbtn} type="submit"></button>
        </Box>
      </CustomDialog>
    </Paper>
  );
};

export default AdReceipt;
