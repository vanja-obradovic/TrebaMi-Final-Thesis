import { Box, Container } from "@mui/system";
import { DocumentData } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import AuthCheck from "../components/AuthCheck";
import { useAuth } from "../contexts/AuthContext";
import app, { auth, firestore, getUser, storage } from "../util/firebase";
import styles from "../styles/userSettings.module.scss";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  FormControl,
  InputLabel,
  LinearProgress,
  NativeSelect,
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  CircularProgress,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
} from "@mui/material";
import { ImageFileUrl } from "../util/imageCropper";
import ImageCropper from "../components/ImgCropper";
import { TiTickOutline } from "react-icons/ti";
import { MdOutlineCancel, MdOutlineExpandMore } from "react-icons/md";
import { format } from "date-fns";
import useId from "@mui/utils/useId";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Map from "../components/Map";
import Image from "next/image";
import CustomDialog from "../components/CustomDialog";

const Settings = () => {
  const dbInstance = firestore.getFirestore(app);
  const storageInstance = storage.getStorage(app);
  const router = useRouter();

  const { currUser, signout } = useAuth();

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [emailChange, setEmailChange] = useState(false);
  const [catChange, setCatChange] = useState(false);
  const [membership, setMembership] = useState("");

  const selectId = useId();

  const [userProfile, setUserProfile] = useState<DocumentData>();

  const name = useRef<HTMLInputElement>();
  const surname = useRef<HTMLInputElement>();
  const number = useRef<HTMLInputElement>();
  const email = useRef<HTMLInputElement>();
  const category = useRef<HTMLSelectElement>();
  const oldPassword = useRef<HTMLInputElement>();
  const newPassword = useRef<HTMLInputElement>();
  const confirmPassword = useRef<HTMLInputElement>();
  const emailDialogPassword = useRef<HTMLInputElement>();
  const catDialogPassword = useRef<HTMLInputElement>();
  const [markerCoords, setMarkerCoords] = useState<{ lng; lat }>();
  const passRegex = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d*.!@#$%^&(){}\[\]:\";'<>,.?\/~`_+-=|]{8,}$/
  );
  const emailRegex = new RegExp(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );

  useEffect(() => {
    const getUserDoc = async () => {
      const userDoc = await getUser(currUser?.uid);
      setUserProfile(userDoc.data());
    };
    getUserDoc();
  }, [currUser?.uid]);

  const imageInput = useRef<HTMLInputElement>();
  const [file, setFile] = useState<File>(null);
  const [photoURL, setURL] = useState("");
  const [croppedImage, setCroppedImage] = useState<ImageFileUrl>(null);

  const fileChosen = (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files[0];
    if (file) {
      setFile(file);
      setURL(window.URL.createObjectURL(file));
      window.URL.revokeObjectURL(croppedImage?.url);
      input.value = "";
    }
  };

  const confirmFileUpload = async () => {
    setLoading(true);
    const oldImageUrl = currUser?.photoURL;
    const oldImagePath = oldImageUrl
      .slice(oldImageUrl.indexOf("avatars"), oldImageUrl.indexOf("jpeg") + 4)
      .replaceAll("%2F", "/");
    const oldImageRef = storage.ref(storageInstance, oldImagePath);

    await storage.deleteObject(oldImageRef).catch((err) => {
      if (err) console.log(err);
    });

    if (croppedImage) {
      const ref = storage.ref(
        storageInstance,
        `avatars/${currUser.uid}/${format(new Date(), "ddMMyyyy_HHmmss")}.${
          croppedImage.fileType
        }`
      );

      const uploadTask = storage.uploadBytesResumable(ref, croppedImage.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.log(`Error while uploading, message: ${error.message}`);
        },
        () => {
          storage.getDownloadURL(ref).then((url) => {
            auth
              .updateProfile(currUser, {
                photoURL: url,
              })
              .then(() => {
                setLoading(false);
                window.URL.revokeObjectURL(croppedImage?.url);
                setCroppedImage(null);
                setProgress(0);
              });
          });
        }
      );
    }
  };

  const cancelFileUpload = () => {
    if (croppedImage) {
      window.URL.revokeObjectURL(croppedImage?.url);
      setCroppedImage(null);
    }
  };

  const updateUserData = async () => {
    const docRef = firestore.doc(dbInstance, `users`, `${currUser?.uid}`);
    firestore
      .updateDoc(docRef, {
        name: name.current.value,
        surname: surname.current.value,
        number: number.current.value,
      })
      .then(() => {
        toast.success("Update successful!");
      })
      .catch(() => {
        toast.error("Error while updating, please try again.");
      });
  };

  const updateUserPassword = async () => {
    if (
      !oldPassword.current.value ||
      !newPassword.current.value ||
      !confirmPassword.current.value
    )
      toast.error("Moraju se popuniti sva polja za promenu lozinke");
    else {
      const credential = auth.EmailAuthProvider.credential(
        currUser?.email,
        oldPassword.current.value
      );
      auth
        .reauthenticateWithCredential(currUser, credential)
        .then(() => {
          if (
            passRegex.test(newPassword.current.value ?? "") &&
            newPassword.current.value === confirmPassword.current.value
          ) {
            auth
              .updatePassword(currUser, newPassword.current.value)
              .then(() => {
                toast.success("Update successful!");
                signout();
                router.replace("/");
              });
          } else {
            toast.error(
              "Lozinka mora imati makar jedno veliko i malo slovo, jedan broj i specijalni karakter i imati minimalno 8 karaktera!\n Lozinke se moraju poklapati!"
            );
          }
        })
        .catch(() => {
          toast.error("Old password doesn't match your input");
        });
    }
  };

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);

  const openEmailDialog = () => {
    if (emailRegex.test(email.current.value)) setEmailDialogOpen(true);
    else {
      setEmailChange(true);
      toast.error("Please enter a correct email address.");
    }
  };

  const closeEmailDialog = (update?: boolean) => {
    if (update === false) {
      email.current.value = currUser?.email;
      setEmailDialogOpen(false);
    } else {
      if (!emailDialogPassword.current.value) {
        toast.error("You must provide password to continue!");
        return;
      }
      setDialogLoading(true);
      const credential = auth.EmailAuthProvider.credential(
        currUser?.email,
        emailDialogPassword.current.value
      );
      auth
        .reauthenticateWithCredential(currUser, credential)
        .then(async () => {
          await auth
            .updateEmail(currUser, email.current.value)
            .then(() => {
              toast.success("Email updated!");
              setEmailDialogOpen(false);
              currUser.reload();
            })
            .catch((err) => {
              if (err.code == "auth/email-already-in-use") {
                toast.error("Email address already in use!");
              } else toast.error("Error while updating, please try again.");
            });
        })
        .catch(() => {
          toast.error("Old password doesn't match your input");
        })
        .finally(() => {
          setDialogLoading(false);
        });
    }
  };

  const openCatDialog = () => {
    setCatDialogOpen(true);
  };

  const closeCatDialog = (update?: boolean) => {
    if (update === false) {
      category.current.value = userProfile?.category;
      setCatDialogOpen(false);
    } else {
      if (!catDialogPassword.current.value) {
        toast.error("You must provide password to continue!");
        return;
      }
      setDialogLoading(true);
      const credential = auth.EmailAuthProvider.credential(
        currUser?.email,
        catDialogPassword.current.value
      );
      auth
        .reauthenticateWithCredential(currUser, credential)
        .then(async () => {
          const docRef = firestore.doc(dbInstance, `users`, `${currUser?.uid}`);
          await firestore
            .updateDoc(docRef, {
              category: category.current.value,
              isProvider: category.current.value === "None" ? false : true,
            })
            .then(async () => {
              toast.success("Update successful!");
              setCatDialogOpen(false);
              const userDoc = await getUser(currUser?.uid);
              setUserProfile(userDoc.data());
            })
            .catch(() => {
              toast.error("Error while updating, please try again.");
            });
        })
        .catch(() => {
          toast.error("Old password doesn't match your input");
        })
        .finally(() => {
          setDialogLoading(false);
        });
    }
  };

  const [mapDialog, setMapDialog] = useState(false);

  const openMapDialog = () => {
    setMapDialog(true);
    setMarkerCoords(null);
  };

  const closeMapDialog = (update?: boolean) => {
    if (update === true) {
      if (markerCoords) {
        toast.success(markerCoords.lng + "" + markerCoords.lat);
        setMapDialog(false);
      } else {
        toast.error("Location not set!");
      }
    } else setMapDialog(false);
  };

  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);

  const openMembershipDialog = () => {
    setMembership(userProfile.membership);
    setMembershipDialogOpen(true);
  };

  const closeMembershipDialog = (update?: boolean) => {
    if (update === true) {
      const docRef = firestore.doc(dbInstance, `users`, `${currUser?.uid}`);
      setDialogLoading(true);
      firestore
        .updateDoc(docRef, {
          membership: membership,
        })
        .then(async () => {
          toast.success("Update successful!");
          setMembershipDialogOpen(false);
          const userDoc = await getUser(currUser?.uid);
          setUserProfile(userDoc.data());
        })
        .catch(() => {
          toast.error("Error while updating, please try again.");
        })
        .finally(() => {
          setDialogLoading(false);
        });
    } else {
      setMembershipDialogOpen(false);
      setMembership(userProfile?.membership);
    }
  };

  return (
    <AuthCheck>
      <Container component="div" maxWidth="xl" className={styles.wrapper}>
        <Box className={styles.photo}>
          <Paper elevation={4} className={styles.paper}>
            <Box className={styles.avatarWrapper}>
              Membership
              <Tooltip title="Change membership" arrow placement="left">
                <span
                  style={
                    userProfile?.membership === "silver"
                      ? { border: "solid silver 2px" }
                      : userProfile?.membership === "gold"
                      ? { border: "solid gold 2px" }
                      : {
                          border: "solid #1caffd 2px",
                        }
                  }
                  onClick={openMembershipDialog}
                >
                  {userProfile?.membership}
                </span>
              </Tooltip>
              {/* <Dialog
                open={membershipDialogOpen}
                onClose={() => closeMembershipDialog(false)}
                classes={{ paper: styles.dialog }}
              >
                <DialogTitle>Change membership</DialogTitle>
                <DialogContentText>
                  {membership === "silver" && (
                    <div>
                      <div>Silver plan:</div>
                      <div className={styles.membershipDetails}>
                        <ul>
                          <li>2 ads</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {membership === "gold" && (
                    <div>
                      <div>Gold plan:</div>
                      <div className={styles.membershipDetails}>
                        <ul>
                          <li>5 ads</li>
                          <li>1 free ad promotion per month</li>
                          <li>200 bonus rep per month</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {membership === "diamond" && (
                    <div>
                      <div>Diamond plan:</div>
                      <div className={styles.membershipDetails}>
                        <ul>
                          <li>10 ads</li>
                          <li>3 free ad promotion per month</li>
                          <li>500 bonus rep per month</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </DialogContentText>
                <DialogContent>
                  <Stack direction="row" className={styles.cardStack}>
                    <Card
                      variant="outlined"
                      className={
                        userProfile?.membership === "silver"
                          ? styles.card
                          : styles.focusedCard
                      }
                      onClick={() => setMembership("silver")}
                    >
                      <CardActionArea>
                        <CardHeader title="Silver"></CardHeader>
                        <CardContent>0 rsd/mo</CardContent>
                      </CardActionArea>
                    </Card>
                    <Card
                      variant="outlined"
                      className={
                        userProfile?.membership === "gold"
                          ? styles.card
                          : styles.focusedCard
                      }
                      onClick={() => setMembership("gold")}
                    >
                      <CardActionArea>
                        <CardHeader title="Gold"></CardHeader>
                        <CardContent>500 rsd/mo</CardContent>
                      </CardActionArea>
                    </Card>
                    <Card
                      variant="outlined"
                      className={
                        userProfile?.membership === "diamond"
                          ? styles.card
                          : styles.focusedCard
                      }
                      onClick={() => setMembership("diamond")}
                    >
                      <CardActionArea>
                        <CardHeader title="Diamond"></CardHeader>
                        <CardContent>1000 rsd/mo</CardContent>
                      </CardActionArea>
                    </Card>
                  </Stack>
                </DialogContent>
                <DialogActions classes={{ root: styles.dialogActions }}>
                  <button onClick={() => closeMembershipDialog(false)}>
                    Cancel
                  </button>
                  {dialogLoading && <CircularProgress size="4.5vmin" />}
                  <button onClick={() => closeMembershipDialog(true)}>
                    Confirm
                  </button>
                </DialogActions>
              </Dialog> */}
              <CustomDialog
                dialogOpen={membershipDialogOpen}
                dialogClose={closeMembershipDialog}
                dialogLoading={dialogLoading}
                title="Change membership"
                nativeContentText={
                  <DialogContentText>
                    {membership === "silver" && (
                      <div>
                        <div>Silver plan:</div>
                        <div className={styles.membershipDetails}>
                          <ul>
                            <li>2 ads</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {membership === "gold" && (
                      <div>
                        <div>Gold plan:</div>
                        <div className={styles.membershipDetails}>
                          <ul>
                            <li>5 ads</li>
                            <li>1 free ad promotion per month</li>
                            <li>200 bonus rep per month</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {membership === "diamond" && (
                      <div>
                        <div>Diamond plan:</div>
                        <div className={styles.membershipDetails}>
                          <ul>
                            <li>10 ads</li>
                            <li>3 free ad promotion per month</li>
                            <li>500 bonus rep per month</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </DialogContentText>
                }
              >
                <Stack direction="row" className={styles.cardStack}>
                  <Card
                    variant="outlined"
                    className={
                      userProfile?.membership === "silver"
                        ? styles.card
                        : styles.focusedCard
                    }
                    onClick={() => setMembership("silver")}
                  >
                    <CardActionArea>
                      <CardHeader title="Silver"></CardHeader>
                      <CardContent>0 rsd/mo</CardContent>
                    </CardActionArea>
                  </Card>
                  <Card
                    variant="outlined"
                    className={
                      userProfile?.membership === "gold"
                        ? styles.card
                        : styles.focusedCard
                    }
                    onClick={() => setMembership("gold")}
                  >
                    <CardActionArea>
                      <CardHeader title="Gold"></CardHeader>
                      <CardContent>500 rsd/mo</CardContent>
                    </CardActionArea>
                  </Card>
                  <Card
                    variant="outlined"
                    className={
                      userProfile?.membership === "diamond"
                        ? styles.card
                        : styles.focusedCard
                    }
                    onClick={() => setMembership("diamond")}
                  >
                    <CardActionArea>
                      <CardHeader title="Diamond"></CardHeader>
                      <CardContent>1000 rsd/mo</CardContent>
                    </CardActionArea>
                  </Card>
                </Stack>
              </CustomDialog>
              {!croppedImage ? (
                <Tooltip title="Upload photo" arrow placement="top">
                  <Avatar
                    src={currUser?.photoURL}
                    className={styles.avatar}
                    onClick={() => {
                      imageInput.current.click();
                    }}
                  ></Avatar>
                </Tooltip>
              ) : (
                <>
                  <div className={styles.avatarWProgress}>
                    <Avatar
                      src={croppedImage?.url}
                      className={styles.avatar}
                      onClick={() => {
                        imageInput.current.click();
                      }}
                    ></Avatar>
                    <div className={styles.progressWrapper}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        classes={{
                          root: styles.progressContainer,
                          bar: styles.progress,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Tooltip
                      title="Cancel upload"
                      arrow
                      disableHoverListener={loading}
                    >
                      <button disabled={loading} onClick={cancelFileUpload}>
                        <MdOutlineCancel />
                      </button>
                    </Tooltip>
                    <Tooltip
                      title="Confirm upload"
                      arrow
                      disableHoverListener={loading}
                    >
                      <button disabled={loading} onClick={confirmFileUpload}>
                        <TiTickOutline />
                      </button>
                    </Tooltip>
                  </div>
                </>
              )}
            </Box>
          </Paper>
        </Box>
        <Box className={styles.settings}>
          <Paper elevation={4} className={styles.paper}>
            {userProfile ? (
              <>
                <Accordion classes={{ root: styles.accordion }}>
                  <AccordionSummary
                    expandIcon={<MdOutlineExpandMore />}
                    classes={{
                      content: styles.accordionSummary,
                      root: styles.accordionSummaryRoot,
                    }}
                  >
                    Change basic information
                  </AccordionSummary>
                  <AccordionDetails className={styles.passwordDetailsWrapper}>
                    <div className={styles.passwordDetails}>
                      <TextField
                        variant="outlined"
                        label="Name"
                        required
                        inputRef={name}
                        size="small"
                        InputLabelProps={{
                          shrink: true,
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        defaultValue={userProfile?.name}
                      ></TextField>
                      <TextField
                        variant="outlined"
                        label="Surname"
                        required
                        inputRef={surname}
                        size="small"
                        defaultValue={userProfile?.surname}
                        InputLabelProps={{
                          shrink: true,
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                      ></TextField>

                      <TextField
                        variant="outlined"
                        label="Number"
                        required
                        size="small"
                        inputRef={number}
                        InputLabelProps={{
                          shrink: true,
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        defaultValue={userProfile?.number}
                      ></TextField>
                      {userProfile?.isProvider && (
                        <>
                          <button onClick={() => openMapDialog()}>
                            Edit location
                          </button>
                          {/* <Dialog
                            open={mapDialog}
                            onClose={() => closeMapDialog(false)}
                            classes={{ paper: styles.dialog }}
                          >
                            <DialogTitle>Edit location</DialogTitle>
                            <DialogContent>
                              <DialogContentText>
                                Location can be set either by geolocation (must
                                be allowed) or by manually setting a marker on
                                the map.
                              </DialogContentText>
                              <Map
                                locationMarker={true}
                                setMarkerCoords={setMarkerCoords}
                                popup={
                                  <Image src={"/loginPic.webp"} layout="fill" />
                                }
                                markerCords={userProfile?.location}
                              ></Map>
                            </DialogContent>
                            <DialogActions
                              classes={{ root: styles.dialogActions }}
                            >
                              <button onClick={() => closeMapDialog(false)}>
                                Cancel
                              </button>
                              {dialogLoading && (
                                <CircularProgress size="4.5vmin" />
                              )}
                              <button onClick={() => closeMapDialog(true)}>
                                Confirm
                              </button>
                            </DialogActions>
                          </Dialog> */}
                          <CustomDialog
                            dialogOpen={mapDialog}
                            dialogClose={closeMapDialog}
                            contentText="Location can be set either by geolocation (must
                                be allowed) or by manually setting a marker on
                                the map."
                            dialogLoading={dialogLoading}
                            title="Edit location"
                          >
                            <Map
                              locationMarker={true}
                              setMarkerCoords={setMarkerCoords}
                              popup={
                                <Image src={"/loginPic.webp"} layout="fill" />
                              }
                              markerCords={userProfile?.location}
                            ></Map>{" "}
                          </CustomDialog>
                        </>
                      )}
                    </div>
                    <button
                      className={styles.confirmButton}
                      onClick={updateUserData}
                    >
                      Confirm changes
                    </button>
                  </AccordionDetails>
                </Accordion>
                <Accordion classes={{ root: styles.accordion }}>
                  <AccordionSummary
                    expandIcon={<MdOutlineExpandMore />}
                    classes={{
                      content: styles.accordionSummary,
                      root: styles.accordionSummaryRoot,
                    }}
                  >
                    Change password
                  </AccordionSummary>
                  <AccordionDetails className={styles.passwordDetailsWrapper}>
                    <div className={styles.passwordDetails}>
                      <TextField
                        variant="outlined"
                        label="Old password"
                        inputRef={oldPassword}
                        required
                        size="small"
                        InputLabelProps={{
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        type="password"
                      ></TextField>
                      <TextField
                        variant="outlined"
                        label="New password"
                        inputRef={newPassword}
                        required
                        size="small"
                        InputLabelProps={{
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        type="password"
                      ></TextField>
                      <TextField
                        variant="outlined"
                        label="Confirm password"
                        inputRef={confirmPassword}
                        required
                        size="small"
                        InputLabelProps={{
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        type="password"
                      ></TextField>
                    </div>
                    <button
                      className={styles.confirmButton}
                      onClick={updateUserPassword}
                    >
                      Confirm changes
                    </button>
                  </AccordionDetails>
                </Accordion>

                <Accordion classes={{ root: styles.accordionDanger }}>
                  <AccordionSummary
                    expandIcon={<MdOutlineExpandMore />}
                    classes={{
                      content: styles.accordionSummary,
                      root: styles.accordionSummaryRoot,
                    }}
                  >
                    Danger zone
                  </AccordionSummary>
                  <AccordionDetails className={styles.dangerZone}>
                    <span>
                      <TextField
                        variant="outlined"
                        type="email"
                        label="Email"
                        size="small"
                        inputRef={email}
                        defaultValue={currUser?.email}
                        InputLabelProps={{
                          shrink: true,
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        disabled={!emailChange}
                      ></TextField>
                      <button
                        style={emailChange ? {} : { backgroundColor: "white" }}
                        onClick={(e) => {
                          e.preventDefault();
                          setEmailChange(!emailChange);
                          if (emailChange) openEmailDialog();
                        }}
                      >
                        {emailChange ? "Confirm" : "Click to change"}
                      </button>
                      <Dialog
                        open={emailDialogOpen}
                        onClose={() => closeEmailDialog(false)}
                        classes={{ paper: styles.dialog }}
                      >
                        <DialogTitle>Confirm delicate action</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            You are about to change email that is linked to this
                            acount, enter your password to proceed.
                          </DialogContentText>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="passwordConfirmationDialog"
                            label="Password"
                            type="password"
                            fullWidth
                            inputRef={emailDialogPassword}
                            variant="outlined"
                            InputLabelProps={{
                              className: styles.inputStyle,
                            }}
                            InputProps={{ className: styles.inputStyle }}
                          />
                        </DialogContent>
                        <DialogActions classes={{ root: styles.dialogActions }}>
                          <button
                            onClick={() => closeEmailDialog(false)}
                            disabled={dialogLoading}
                          >
                            Cancel
                          </button>
                          {dialogLoading && <CircularProgress size="4.5vmin" />}
                          <button
                            onClick={() => closeEmailDialog()}
                            disabled={dialogLoading}
                          >
                            Confirm
                          </button>
                        </DialogActions>
                      </Dialog>
                    </span>
                    <span>
                      <FormControl disabled={!catChange}>
                        <InputLabel
                          htmlFor={selectId}
                          classes={{ root: styles.labelStyle }}
                        >
                          Category
                        </InputLabel>
                        <NativeSelect
                          className={styles.selectStyle}
                          inputProps={{ id: selectId, variant: "outlined" }}
                          defaultValue={userProfile?.category}
                          inputRef={category}
                        >
                          <option value={null}>None</option>
                          <option value={"products"}>Products</option>
                          <option value={"services"}>Services</option>
                        </NativeSelect>
                      </FormControl>
                      <button
                        style={catChange ? {} : { backgroundColor: "white" }}
                        onClick={(e) => {
                          e.preventDefault();
                          setCatChange(!catChange);
                          if (catChange) openCatDialog();
                        }}
                      >
                        {catChange ? "Confirm" : "Click to change"}
                      </button>
                      <Dialog
                        open={catDialogOpen}
                        onClose={() => closeCatDialog(false)}
                        classes={{ paper: styles.dialog }}
                      >
                        <DialogTitle>Confirm delicate action</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            You are about to change your account category. By
                            proceeding with this action you will loose all your
                            reputation, ratings and comments. Enter your
                            password to continue:
                          </DialogContentText>
                          <TextField
                            autoFocus
                            margin="dense"
                            id="passwordConfirmationDialog"
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            inputRef={catDialogPassword}
                            InputLabelProps={{
                              className: styles.inputStyle,
                            }}
                            InputProps={{ className: styles.inputStyle }}
                          />
                        </DialogContent>
                        <DialogActions classes={{ root: styles.dialogActions }}>
                          <button
                            onClick={() => closeCatDialog(false)}
                            disabled={dialogLoading}
                          >
                            Cancel
                          </button>
                          {dialogLoading && <CircularProgress size="4.5vmin" />}
                          <button
                            onClick={() => closeCatDialog()}
                            disabled={dialogLoading}
                          >
                            Confirm
                          </button>
                        </DialogActions>
                      </Dialog>
                    </span>
                  </AccordionDetails>
                </Accordion>
                {/* </Box> */}
              </>
            ) : (
              <Box className={styles.grid}>
                <Skeleton height="15vmin" animation="wave"></Skeleton>
                <Skeleton height="15vmin" animation="wave"></Skeleton>
                <Skeleton height="15vmin" animation="wave"></Skeleton>
              </Box>
            )}
          </Paper>
        </Box>
        <input
          ref={imageInput}
          type="file"
          name="pic"
          id="pic11"
          onChange={fileChosen}
          hidden
        />
        {file && (
          <ImageCropper
            aspect={1 / 1}
            image={photoURL}
            setCroppedImage={setCroppedImage}
            setFile={setFile}
            setURL={setURL}
          />
        )}
      </Container>
    </AuthCheck>
  );
};

export default Settings;
