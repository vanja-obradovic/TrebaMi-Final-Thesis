import { Box, Button, Paper, Rating, TextField } from "@mui/material";
import { format } from "date-fns";
import { getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import useArray from "../hooks/useArray";
import { Receipt } from "../models/Receipt";
import { userSchema } from "../models/User";
import styles from "../styles/adReceipt.module.scss";
import app, { firestore, storage } from "../util/firebase";
import { ImageFileUrl } from "../util/imageCropper";
import CustomDialog from "./CustomDialog";
import GalleryCropper from "./ImgCropperWGallery";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { v4 as uuidv4 } from "uuid";

type CommentData = {
  comment: string;
  rating: number;
  title: string;
};

type ReportData = {
  text: string;
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
  const [loading, setLoading] = useState(false);

  //* Confirm and abort for simple purchase
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
  //! Confirm and abort for simple purchase

  //* Comment submission
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
  const submitbtn = useRef<HTMLButtonElement>();

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
    const sellerProfileRef = firestore.doc(
      firestore.getFirestore(app),
      `users/${sellerID}`
    );

    getDoc(sellerProfileRef).then((res) => {
      const userData = userSchema.cast(res.data());
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
      batch.update(sellerProfileRef, {
        rating:
          (userData.rating ?? 0 * userData.commentsNumber + data.rating) /
          (userData.commentsNumber + 1),
        reputation: firestore.increment(Math.floor(+data.rating)),
        commentsNumber: firestore.increment(1),
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
    });
  };

  const handleCommentErr = (err) => {
    if (err.title) toast.error(err.title.message);
    if (err.rating) toast.error(err.rating.message);
  };
  //! Comment submission

  //* Report submission
  const {
    register: reportRegister,
    handleSubmit: handleReportSubmit,
    formState: { isValid: isValidReport },
  } = useForm<ReportData>({
    defaultValues: { text: null },
    shouldUnregister: true,
    mode: "onBlur",
  });

  const [reportDialog, setReportDialog] = useState(false);
  const reportSubmitBtn = useRef<HTMLButtonElement>();

  const imageInput = useRef<HTMLInputElement>();
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  const {
    array: croppedImages,
    set: setCroppedImages,
    remove: removeImg,
  } = useArray<ImageFileUrl>([]);

  const removeImage = (index: number) => {
    window.URL.revokeObjectURL(croppedImages[index].url);
    removeImg(index);
  };

  const fileChosen = (e) => {
    const input = e.target as HTMLInputElement;
    const fileArr = input.files;
    if (fileArr) {
      for (const file of fileArr) {
        setPhotoURLs((prev) => [...prev, window.URL.createObjectURL(file)]);
      }
      input.value = "";
    }
  };

  const imageAsPromise = (baseRef, adRef, image: ImageFileUrl) => {
    const ref = storage.ref(
      baseRef,
      `${adRef}/${buyerID}/${uuidv4()}.${image.fileType}`
    );
    return new Promise((resolve, reject) => {
      const uploadTask = storage.uploadBytesResumable(ref, image.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.log(`Error while uploading, message: ${error.message}`);
        },
        () => {
          storage.getDownloadURL(ref).then((url) => {
            resolve(url);
          });
        }
      );
    });
  };

  const uploadImages = (text: string) => {
    const promises = [];
    if (!!croppedImages.length) {
      const ref = storage.ref(storage.getStorage(app), `report`);

      for (const image of croppedImages) {
        promises.push(imageAsPromise(ref, aid, image));
      }

      toast.promise(
        Promise.all(promises).then((urls) => {
          firestore.addDoc(
            firestore.collection(firestore.getFirestore(app), `report`),
            {
              images: urls,
              submittedBy: buyerID,
              submittedAt: new Date().getTime(),
              aid: aid,
              adTitle: adTitle,
              uid: sellerID,
              description: text,
            }
          );
        }),
        { success: "Uspeh!", pending: "U toku...", error: "Greska" }
      );
    } else {
      firestore.addDoc(
        firestore.collection(firestore.getFirestore(app), `report`),
        {
          images: [],
          submittedBy: buyerID,
          submittedAt: new Date().getTime(),
          aid: aid,
          adTitle: adTitle,
          uid: sellerID,
          description: text,
        }
      );
    }
  };

  const handleReportClose = (state) => {
    if (state === true) {
      reportSubmitBtn.current.click();
      if (isValidReport) {
        setReportDialog(false);
        croppedImages.forEach((image) => window.URL.revokeObjectURL(image.url));
        setCroppedImages([]);
      }
    } else setReportDialog(false);
  };

  const handleReportForm = (data: ReportData) => {
    uploadImages(data.text);
  };

  const handleReportErr = (err) => {
    if (err.text) toast.error(err.text.message);
  };

  return (
    <Paper className={styles.receiptWrapper}>
      <Box className={styles.receipt}>
        <h2>
          <Link href={{ pathname: "/ad", query: { prov: sellerID, aID: aid } }}>
            {adTitle}
          </Link>
        </h2>
        {currUser?.uid === sellerID && (
          <span>
            Kupac:&nbsp;
            <Link href={{ pathname: "/user", query: { id: buyerID } }}>
              {displayName}
            </Link>
          </span>
        )}
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
            color="error"
            onClick={() => setReportDialog(true)}
            disabled={loading}
          >
            Prijavi korisnika
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
      <CustomDialog
        dialogOpen={reportDialog}
        dialogClose={handleReportClose}
        title="Forma za prijavu korisnika"
        contentText="Detaljan opis i par slika mogu dosta olaksati administratoru u odlucivanju po pitanju prijave"
      >
        <Box
          component="form"
          onSubmit={handleReportSubmit(handleReportForm, handleReportErr)}
          className={styles.commentForm}
        >
          <TextField
            label="Tekst prijave"
            {...reportRegister("text", {
              required: "Tekst prijave ne moze biti prazan!",
              minLength: {
                value: 30,
                message: "Tekst mora imati minimalno 30 karaktera",
              },
            })}
            multiline
            minRows={5}
          ></TextField>

          <>
            <input
              type="file"
              name="fileInput"
              id="fileInput"
              hidden
              ref={imageInput}
              onChange={fileChosen}
              accept="image/jpeg, image/jpg, image/png, image/webp"
              multiple
            />

            <GalleryCropper
              aspect={3 / 2}
              images={photoURLs}
              setCroppedImage={setCroppedImages}
              setPhotoURLs={setPhotoURLs}
              inputRef={imageInput}
            ></GalleryCropper>
            <Box className={styles.gallery}>
              {croppedImages.map((img, index) => {
                return (
                  <Box key={index} className={styles.imageWrapper}>
                    <Image key={index} src={img.url} layout="fill"></Image>
                    <ClearOutlinedIcon
                      onClick={() => {
                        removeImage(index);
                      }}
                      className={styles.imageClear}
                      color="warning"
                    />
                  </Box>
                );
              })}
            </Box>
          </>

          <button hidden ref={reportSubmitBtn} type="submit"></button>
        </Box>
      </CustomDialog>
    </Paper>
  );
};

export default AdReceipt;
