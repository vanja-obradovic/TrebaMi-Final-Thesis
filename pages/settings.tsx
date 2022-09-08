import { Box, Container } from "@mui/system";
import { DocumentData, GeoPoint } from "firebase/firestore";
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
  Paper,
  Skeleton,
  TextField,
  Tooltip,
  DialogContentText,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  MenuItem,
  Select,
  Button,
  IconButton,
} from "@mui/material";
import { ImageFileUrl } from "../util/imageCropper";
import ImageCropper from "../components/ImgCropper";
import { TiTickOutline } from "react-icons/ti";
import { MdOutlineCancel } from "react-icons/md";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { format } from "date-fns";
import useId from "@mui/utils/useId";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Map from "../components/Map";
import Image from "next/image";
import CustomDialog from "../components/CustomDialog";
import { useForm } from "react-hook-form";
import { Location } from "../models/Location";

type basicFormData = {
  name: string;
  surname: string;
  number: string;
};

type passFormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const Settings = ({ userData }) => {
  const dbInstance = firestore.getFirestore(app);
  const storageInstance = storage.getStorage(app);
  const [userProfile, setUserProfile] = useState<DocumentData>();
  const router = useRouter();
  const { register: basicRegister, handleSubmit: basicSubmit } =
    useForm<basicFormData>({
      defaultValues: {
        name: userProfile?.name,
        surname: userProfile?.surname,
        number: userProfile?.number,
      },
    });
  const {
    register: passRegister,
    handleSubmit: passSubmit,
    getValues: getPassValues,
  } = useForm<passFormData>();

  const { currUser, signout } = useAuth();

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [emailChange, setEmailChange] = useState(false);
  const [catChange, setCatChange] = useState(false);
  const [membership, setMembership] = useState("");

  const selectId = useId();

  const email = useRef<HTMLInputElement>();
  const category = useRef<HTMLSelectElement>();
  const emailDialogPassword = useRef<HTMLInputElement>();
  const catDialogPassword = useRef<HTMLInputElement>();
  const [location, setLocation] = useState<Location>();
  const passRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d*.!@#$%^&(){}\[\]:\";'<>,.?\/~`_+-=|]{8,}$/;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

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
            const adsRef = firestore.collection(
              dbInstance,
              `users/${currUser?.uid}/ads`
            );
            const commentsRef = firestore.collection(
              dbInstance,
              `users/${currUser?.uid}/comments`
            );
            const batch = firestore.writeBatch(dbInstance);

            firestore.getDocs(adsRef).then((docs) => {
              docs.forEach((doc) => {
                batch.update(doc.ref, { "provider.photoURL": url });
              });
              firestore.getDocs(commentsRef).then((docs) => {
                docs.forEach((doc) => {
                  batch.update(doc.ref, { "commenter.photoURL": url });
                });
                batch.commit();
              });
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

  const updateUserData = async (data: basicFormData) => {
    console.log(data);
    const docRef = firestore.doc(dbInstance, `users`, `${currUser?.uid}`);
    const adsRef = firestore.collection(
      dbInstance,
      `users/${currUser?.uid}/ads`
    );
    const commentsRef = firestore.collection(
      dbInstance,
      `users/${currUser?.uid}/comments`
    );

    const batch = firestore.writeBatch(dbInstance);

    batch.update(docRef, {
      name: data.name,
      surname: data.surname,
      number: data.number,
    });

    firestore.getDocs(adsRef).then((docs) => {
      docs.forEach((doc) => {
        batch.update(doc.ref, {
          "provider.displayName":
            data.name.charAt(0).toUpperCase() +
            data.name.slice(1) +
            " " +
            data.surname.charAt(0).toUpperCase() +
            data.surname.slice(1),
        });
      });
      firestore.getDocs(commentsRef).then((docs) => {
        docs.forEach((doc) => {
          batch.update(doc.ref, {
            "commenter.displayName":
              data.name.charAt(0).toUpperCase() +
              data.name.slice(1) +
              " " +
              data.surname.charAt(0).toUpperCase() +
              data.surname.slice(1),
          });
        });
        toast.promise(
          batch.commit().then(() => {
            auth.updateProfile(currUser, {
              displayName:
                data.name.charAt(0).toUpperCase() +
                data.name.slice(1) +
                " " +
                data.surname.charAt(0).toUpperCase() +
                data.surname.slice(1),
            });
          }),
          {
            success: "Update successful!",
            pending: "Update in progress...",
            error: "Error while updating, please try again.",
          }
        );
      });
    });
  };

  const handleUserUpdateErr = (err) => {
    if (err.name) toast.error(err.name.message, { autoClose: 2500 });
    if (err.surname) toast.error(err.surname.message, { autoClose: 2500 });
    if (err.number) toast.error(err.number.message, { autoClose: 2500 });
  };

  const updateUserPassword = async (data: passFormData) => {
    const credential = auth.EmailAuthProvider.credential(
      currUser?.email,
      data.oldPassword
    );

    toast.promise(
      auth.reauthenticateWithCredential(currUser, credential).then(() => {
        toast.promise(
          auth.updatePassword(currUser, data.newPassword).then(() => {
            signout();
            router.replace("/");
          }),
          {
            success: "Update successful!",
            pending: "Update in progress",
            error: "Update failed!",
          }
        );
      }),
      {
        success: "Authentication successful!",
        pending: "Authentication in progress...",
        error: "Authentication failed!",
      }
    );
  };

  const handlePassUpdateErr = (err) => {
    if (err.oldPassword)
      toast.error(err.oldPassword.message, { autoClose: 2500 });
    if (err.newPassword)
      toast.error(err.newPassword.message, { autoClose: 2500 });
    if (err.confirmPassword)
      toast.error(err.confirmPassword.message, { autoClose: 2500 });
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
              changeInit: true,
            })
            .then(async () => {
              firestore.setDoc(
                firestore.doc(dbInstance, `catChange/${currUser?.uid}`),
                { id: currUser?.uid }
              );
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
    setLocation(null);
  };

  const closeMapDialog = (update?: boolean) => {
    if (update === true) {
      if (location) {
        const docRef = firestore.doc(dbInstance, `users`, `${currUser?.uid}`);
        const adsRef = firestore.collection(
          dbInstance,
          `users/${currUser?.uid}/ads`
        );
        setDialogLoading(true);
        firestore
          .updateDoc(docRef, {
            location: location,
          })
          .then(async () => {
            toast.success("Update successful!");
            setMapDialog(false);
            const userDoc = await getUser(currUser?.uid);
            setUserProfile(userDoc.data());

            const batch = firestore.writeBatch(dbInstance);

            firestore.getDocs(adsRef).then((docs) => {
              docs.forEach((doc) => {
                batch.update(doc.ref, { "provider.location": location });
              });
              batch.commit();
            });
          })
          .catch(() => {
            toast.error("Error while updating, please try again.");
          })
          .finally(() => {
            setDialogLoading(false);
          });
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

      let rep, adPermit, promotionPermit;

      switch (membership) {
        case "silver": {
          rep = 0;
          adPermit = 2;
          promotionPermit = 0;
          break;
        }
        case "gold": {
          rep = 200;
          adPermit = 5;
          promotionPermit = 1;
          break;
        }
        case "diamond": {
          rep = 500;
          adPermit = 10;
          promotionPermit = 3;
          break;
        }
      }

      setDialogLoading(true);

      firestore
        .updateDoc(docRef, {
          membership: membership,
          reputation: firestore.increment(rep),
          "ad.permitted": adPermit,
          "adPromotion.permitted": promotionPermit,
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
              <Tooltip title="Promenite tip clanstva" arrow placement="left">
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
              <CustomDialog // *Dialog for membership
                dialogOpen={membershipDialogOpen}
                dialogClose={closeMembershipDialog}
                dialogLoading={dialogLoading}
                title="Promena tipa clanstva"
                nativeContentText={
                  <DialogContentText>
                    {membership === "silver" && (
                      <div>
                        <div>Srebrni plan:</div>
                        <div className={styles.membershipDetails}>
                          <ul>
                            <li>2 oglasa</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {membership === "gold" && (
                      <div>
                        <div>Zlatni plan:</div>
                        <div className={styles.membershipDetails}>
                          <ul>
                            <li>5 oglasa</li>
                            <li>1 besplatna promocija oglasa po mesecu</li>
                            <li>200 bonus reputacije po mesecu</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    {membership === "diamond" && (
                      <div>
                        <div>Dijamantski plan:</div>
                        <div className={styles.membershipDetails}>
                          <ul>
                            <li>10 oglasa</li>
                            <li>3 besplatne promocije oglasa po mesecu</li>
                            <li>500 bonus reputacije po mesecu</li>
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
                      <CardHeader title="Srebrno"></CardHeader>
                      <CardContent>0 rsd/mes</CardContent>
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
                      <CardHeader title="Zlatno"></CardHeader>
                      <CardContent>500 rsd/mes</CardContent>
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
                      <CardHeader title="Dijamantsko"></CardHeader>
                      <CardContent>1000 rsd/mes</CardContent>
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
                // *Section that is displayed when changing photo
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
                  <div className={styles.avatarActions}>
                    <Tooltip
                      title="Otkazi promenu"
                      arrow
                      disableHoverListener={loading}
                    >
                      <Button
                        disabled={loading}
                        onClick={cancelFileUpload}
                        variant="contained"
                        color="error"
                      >
                        <MdOutlineCancel />
                      </Button>
                    </Tooltip>
                    <Tooltip
                      title="Potvrdi promenu"
                      arrow
                      disableHoverListener={loading}
                    >
                      <Button
                        disabled={loading}
                        onClick={confirmFileUpload}
                        variant="contained"
                        color="success"
                      >
                        <TiTickOutline />
                      </Button>
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
                <Accordion // *Accordion for basic changes
                  classes={{ root: styles.accordion }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    classes={{
                      content: styles.accordionSummary,
                      root: styles.accordionSummaryRoot,
                    }}
                  >
                    Promena osnovnih podataka
                  </AccordionSummary>
                  <AccordionDetails className={styles.passwordDetailsWrapper}>
                    <Box
                      component="form"
                      className={styles.passwordDetails}
                      noValidate
                      onSubmit={basicSubmit(
                        updateUserData,
                        handleUserUpdateErr
                      )}
                    >
                      <TextField
                        variant="outlined"
                        label="Ime"
                        required
                        {...basicRegister("name", {
                          required: "Morate uneti ime",
                        })}
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
                        label="Prezime"
                        required
                        {...basicRegister("surname", {
                          required: "Morate uneti prezime",
                        })}
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
                        label="Broj telefona"
                        required
                        size="small"
                        {...basicRegister("number", {
                          required: "Morate uneti broj telefona",
                        })}
                        InputLabelProps={{
                          shrink: true,
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        defaultValue={userProfile?.number}
                      ></TextField>
                      {userProfile?.isProvider && (
                        <>
                          <Button
                            onClick={() => openMapDialog()}
                            color="secondary"
                            variant="outlined"
                            endIcon={<MapOutlinedIcon />}
                          >
                            Promeni lokaciju
                          </Button>

                          <CustomDialog // *Dialog for map
                            dialogOpen={mapDialog}
                            dialogClose={closeMapDialog}
                            contentText="Lokacija se moze postaviti ili automatski(mora biti odobreno) ili rucno postavljanjem markera na mapi duplim klikom"
                            dialogLoading={dialogLoading}
                            title="Promena lokacije"
                          >
                            <Map
                              locationMarker={true}
                              setLocation={setLocation}
                              popup={
                                <Image src={"/loginPic.webp"} layout="fill" />
                              }
                              markerCords={userProfile?.location.coords}
                            ></Map>{" "}
                          </CustomDialog>
                        </>
                      )}
                      <Button
                        className={styles.confirmButton}
                        type="submit"
                        variant="contained"
                      >
                        Potvrdi promene
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion // *Accordion for password change
                  classes={{ root: styles.accordion }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    classes={{
                      content: styles.accordionSummary,
                      root: styles.accordionSummaryRoot,
                    }}
                  >
                    Promena lozinke
                  </AccordionSummary>
                  <AccordionDetails className={styles.passwordDetailsWrapper}>
                    <Box
                      component="form"
                      className={styles.passwordDetails}
                      noValidate
                      onSubmit={passSubmit(
                        updateUserPassword,
                        handlePassUpdateErr
                      )}
                    >
                      <TextField
                        variant="outlined"
                        label="Stara lozinka"
                        {...passRegister("oldPassword", {
                          required: "Morate uneti staru lozinku",
                        })}
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
                        label="Nova lozinka"
                        {...passRegister("newPassword", {
                          required: "Morate uneti novu lozinku",
                          pattern: {
                            value: passRegex,
                            message:
                              "Lozinka mora imati makar jedno veliko i malo slovo, jedan broj i specijalni karakter i imati minimalno 8 karaktera!",
                          },
                        })}
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
                        label="Potvrda lozinke"
                        {...passRegister("confirmPassword", {
                          required: "Morate uneti potvrdu lozinke",
                          validate: {
                            check: (value) =>
                              value === getPassValues("newPassword") ||
                              "Lozinke se ne poklapaju",
                          },
                        })}
                        required
                        size="small"
                        InputLabelProps={{
                          className: styles.inputStyle,
                        }}
                        InputProps={{ className: styles.inputStyle }}
                        type="password"
                      ></TextField>
                      <Button
                        className={styles.confirmButton}
                        type="submit"
                        variant="contained"
                      >
                        Potvrdi promene
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion // *Accordion for delicate operations
                  classes={{ root: styles.accordionDanger }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    classes={{
                      content: styles.accordionSummary,
                      root: styles.accordionSummaryRoot,
                    }}
                  >
                    Opasna zona
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
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setEmailChange(!emailChange);
                          if (emailChange) openEmailDialog();
                        }}
                        color={emailChange ? "error" : "info"}
                        variant="contained"
                      >
                        {emailChange ? "Potvrdi" : "Promeni"}
                      </Button>

                      <CustomDialog // *Dialog for changing email
                        dialogOpen={emailDialogOpen}
                        dialogClose={closeEmailDialog}
                        dialogLoading={dialogLoading}
                        title="Potvrdite delikatnu operaciju"
                        contentText="Da biste promenili email koji je povezan sa ovim nalogom, morate uneti Vasu lozinku:"
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="passwordConfirmationDialog"
                          label="Lozinka"
                          type="password"
                          fullWidth
                          inputRef={emailDialogPassword}
                          variant="outlined"
                          size="small"
                          InputLabelProps={{
                            className: styles.inputStyle,
                          }}
                          InputProps={{ className: styles.inputStyle }}
                        />
                      </CustomDialog>
                    </span>
                    <span>
                      <FormControl disabled={!catChange} size="small">
                        <InputLabel
                          htmlFor={selectId}
                          classes={{ root: styles.labelStyle }}
                        >
                          Kategorija
                        </InputLabel>
                        <Select
                          className={styles.selectStyle}
                          inputProps={{ id: selectId, variant: "outlined" }}
                          defaultValue={
                            userProfile?.changeInit ? "" : userProfile?.category
                          }
                          inputRef={category}
                          label="Kategorija"
                        >
                          <MenuItem value={null}>Nijedna</MenuItem>
                          <MenuItem value={"products"}>Proizvodi</MenuItem>
                          <MenuItem value={"services"}>Usluge</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setCatChange(!catChange);
                          if (catChange) openCatDialog();
                        }}
                        color={catChange ? "error" : "info"}
                        variant="contained"
                        disabled={userProfile?.changeInit}
                      >
                        {catChange ? "Potvrdi" : "Promeni"}
                      </Button>

                      <CustomDialog // *Dialog for changing category
                        dialogOpen={catDialogOpen}
                        dialogClose={closeCatDialog}
                        dialogLoading={dialogLoading}
                        title="Potvrdite delikatnu operaciju"
                        contentText=" Ovom akcijom cete promeniti kategoriju ovog naloga. Ako nastavite saglasni ste da izgubite svu reputaciju, rejting i komentare. Morate uneti lozinku da biste nastavili:"
                      >
                        <TextField
                          autoFocus
                          margin="dense"
                          id="passwordConfirmationDialog"
                          label="Lozinka"
                          type="password"
                          fullWidth
                          size="small"
                          variant="outlined"
                          inputRef={catDialogPassword}
                          InputLabelProps={{
                            className: styles.inputStyle,
                          }}
                          InputProps={{ className: styles.inputStyle }}
                        />
                      </CustomDialog>
                    </span>
                  </AccordionDetails>
                </Accordion>
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
