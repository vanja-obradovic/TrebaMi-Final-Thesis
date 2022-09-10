import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Rating,
  TextField,
} from "@mui/material";
import { Box, Container } from "@mui/system";
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import app, {
  deleteAd,
  firestore,
  getAdByRef,
  getAdComments,
  getUser,
  newChat,
  updateAd,
} from "../util/firebase";
import styles from "../styles/adDetails.module.scss";
import UserDetails from "../components/UserDetails";
import Map from "../components/Map";
import { useRouter } from "next/router";
import Gallery from "../components/Gallery";
import {
  adSchema,
  Advertisement,
  productSubCategories,
} from "../models/Advertisement";
import { Comment } from "../models/Comment";
import AdComment from "../components/AdComment";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { onSnapshot } from "firebase/firestore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import CustomDialog from "../components/CustomDialog";
import AuthCheck from "../components/AuthCheck";

export const getServerSideProps = async ({ query, res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=20, stale-while-revalidate=119"
  );
  const adDoc = await getAdByRef(query.prov, query.aID);
  if (adDoc.data() === undefined) {
    return {
      notFound: true,
    };
  }
  const ad = adSchema.cast(adDoc.data());
  // const comments = await getAdComments(query.aID as string);
  return {
    props: {
      adDetails: ad,
      // comments: comments.sort((a, b) => b.timestamp - a.timestamp),
    },
  };
};

type FormData = {
  quantity: number;
};

type EditData = {
  name: string;
  editQuantity: number;
  price: number;
  description: string;
};

const AdDetails = ({
  adDetails,
}: // comments,
{
  adDetails: Advertisement;
  // comments: Comment[];
}) => {
  const { currUser } = useAuth();
  const [ad, setRtAD] = useState<Advertisement>(adDetails);
  const [comments, setComments] = useState<Comment[]>([]);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { quantity: 1 } });

  const {
    register: registerEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors, isValid, isDirty },
    reset: resetEdit,
  } = useForm<EditData>({
    mode: "onBlur",
    defaultValues: {
      name: ad.name,
      description: ad.description,
      price: ad.price,
      editQuantity: ad.quantity,
    },
    shouldUnregister: true,
  });

  const [edit, setEdit] = useState(false);
  const submitBtn = useRef<HTMLButtonElement>();

  const [anchor, setAnchor] = useState<HTMLElement>();
  const open = Boolean(anchor);
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };

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

    getUser(currUser.uid).then((user) => {
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
            isProvider: user.data().isProvider,
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

    getAdComments(router.query.aID as string).then((res) => {
      setComments(res.sort((a, b) => b.timestamp - a.timestamp));
    });

    return unsub;
  }, []);

  const startChat = () => {
    getUser(currUser.uid).then((user) => {
      const time = new Date().getTime();
      const members = [
        {
          displayName: currUser.displayName,
          uid: currUser.uid,
          photoURL: currUser.photoURL,
          isProvider: user.data().isProvider,
        },
        {
          displayName: ad.provider.displayName,
          uid: router.query.prov as string,
          photoURL: ad.provider.photoURL,
          isProvider: true,
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
      }).then((res) =>
        router.push({
          pathname: "chat",
          query: { id: res.id },
        })
      );
    });
  };

  const handleEdit = (data: EditData) => {
    if (isDirty) {
      toast.promise(
        updateAd(router.query.aID as string, router.query.prov as string, data),
        {
          pending: "U toku...",
          error: "Greska, pokusajte ponovo",
          success: "Uspeh!",
        }
      );
      resetEdit();
    }
  };
  const handleEditError = () => {};

  const [deleteDialog, setDeleteDialog] = useState(false);

  const closeDeleteDialog = (state: boolean) => {
    if (state === true) {
      const imageRefs = [];
      for (const image of ad.images) {
        imageRefs.push(
          image
            .slice(image.indexOf("user"), image.indexOf("jpeg") + 4)
            .replaceAll("%2F", "/")
        );
      }
      toast.promise(
        deleteAd(
          router.query.aID as string,
          router.query.prov as string,
          imageRefs
        ),
        {
          pending: "U toku...",
          error: "Greska, pokusajte ponovo",
          success: "Uspeh!",
        }
      );
      router.replace("/profile");
      setDeleteDialog(false);
    } else {
      setDeleteDialog(false);
    }
  };

  return (
    <AuthCheck>
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
            {currUser?.uid === router.query.prov ? (
              <Box
                component="form"
                onSubmit={submitEdit(handleEdit, handleEditError)}
                name="edit"
                className={styles.editForm}
              >
                <button hidden ref={submitBtn} type="submit"></button>
                <span className={styles.adTitle}>
                  {!edit ? (
                    <h1>{ad.name}</h1>
                  ) : (
                    <TextField
                      label="Naziv"
                      error={!!editErrors.name}
                      {...registerEdit("name", {
                        required: "Naziv je obavezan",
                        minLength: {
                          value: 3,
                          message: "Minimalno 3 karaktera za naziv",
                        },
                        maxLength: {
                          value: 25,
                          message: "Maksimalno 25 karaktera za naziv",
                        },
                      })}
                      InputLabelProps={{
                        className: styles.inputStyle,
                      }}
                      InputProps={{ className: styles.inputStyle }}
                    ></TextField>
                  )}
                  <Rating
                    value={ad.rating}
                    precision={0.5}
                    readOnly
                    size="medium"
                    classes={{ root: styles.rating }}
                  />
                  {!edit ? (
                    <>
                      <IconButton onClick={handleClick} className={styles.more}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        open={open}
                        anchorEl={anchor}
                        onClose={handleClose}
                        // TransitionComponent={Zoom}
                        PaperProps={{ className: styles.menu }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <MenuItem onClick={() => setEdit(true)}>
                          Izmeni
                        </MenuItem>
                        <MenuItem
                          sx={{ color: "red" }}
                          onClick={() => setDeleteDialog(true)}
                        >
                          Obrisi
                        </MenuItem>
                      </Menu>
                      <CustomDialog
                        dialogOpen={deleteDialog}
                        dialogClose={closeDeleteDialog}
                        title="Potvrdite delikatnu operaciju"
                        contentText="Da li ste sigrurni da zelite da obriste ovaj oglas?"
                      >
                        <div hidden></div>
                      </CustomDialog>
                    </>
                  ) : (
                    <IconButton
                      onClick={(e: any) => {
                        if (isValid) setEdit(false);
                        setAnchor(null);
                        submitBtn?.current.click();
                      }}
                      className={styles.more}
                    >
                      <DoneOutlinedIcon />
                    </IconButton>
                  )}
                </span>

                <Gallery images={ad.images}></Gallery>

                <Paper className={styles.actionWrapper} elevation={4}>
                  <Box className={styles.ownerAdInfo}>
                    {!edit ? (
                      <div>
                        <h4>Cena:&nbsp;</h4>
                        <div>
                          {ad.price === -1 ? "Po dogovoru" : ad.price}
                          {ad.priceUnit}
                        </div>
                      </div>
                    ) : ad.category === "products" ? (
                      <TextField
                        label="Cena"
                        error={!!editErrors.price}
                        type="number"
                        {...registerEdit("price", {
                          required: "Cena je obavezna",
                          min: {
                            value: 1,
                            message: "Cena ne moze biti manja od 1",
                          },
                          valueAsNumber: true,
                        })}
                        InputLabelProps={{
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                      ></TextField>
                    ) : (
                      <></>
                    )}
                    {ad.category === "services" ? (
                      <></>
                    ) : !edit ? (
                      <div>
                        <h4>Raspolozivo:&nbsp;</h4>
                        <div>{ad.quantity}</div>
                      </div>
                    ) : (
                      <TextField
                        label="Kolicina"
                        error={!!editErrors.editQuantity}
                        type="number"
                        {...registerEdit("editQuantity", {
                          required: "Kolicina je obavezna",
                          min: {
                            value: 0,
                            message: "Kolicina ne moze biti manja od 0",
                          },
                          valueAsNumber: true,
                        })}
                        InputLabelProps={{
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                      ></TextField>
                    )}
                  </Box>
                </Paper>
                {!edit ? (
                  <Paper className={styles.description} elevation={4}>
                    <h3>Opis:</h3>
                    {ad.description}
                  </Paper>
                ) : (
                  <TextField
                    label="Opis"
                    error={!!editErrors.description}
                    multiline
                    minRows={3}
                    fullWidth
                    {...registerEdit("description", {
                      required: "Opis je obavezan",
                    })}
                    InputLabelProps={{
                      className: styles.inputStyle,
                    }}
                    InputProps={{ className: styles.inputStyle }}
                  ></TextField>
                )}

                {comments.map((item, index) => {
                  return <AdComment {...item} key={index}></AdComment>;
                })}
              </Box>
            ) : (
              <>
                <span className={styles.adTitle}>
                  <h1>{ad.name}</h1>
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
                    name="buy"
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
                          InputLabelProps={{
                            className: styles.inputStyle,
                          }}
                          InputProps={{ className: styles.inputStyle }}
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
                          !!errors.quantity ||
                          ad.pendingUsers.includes(currUser?.uid)
                        }
                      >
                        Pregovaraj
                      </Button>
                    </div>
                  </Box>
                </Paper>
                <Paper className={styles.description} elevation={4}>
                  <h3>Opis:</h3>
                  <div>{ad.description}</div>
                </Paper>

                <Paper elevation={4} className={styles.commentWrapper}>
                  <h3>Komentari:</h3>
                  {comments.map((item, index) => {
                    return <AdComment {...item} key={index}></AdComment>;
                  })}
                </Paper>
              </>
            )}
          </Paper>
        </Paper>
      </Container>
    </AuthCheck>
  );
};

export default AdDetails;
