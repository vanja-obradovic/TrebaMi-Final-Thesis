import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import ImageCropper from "../components/ImgCropper";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/setup.module.scss";
import { ImageFileUrl } from "../util/imageCropper";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { toast } from "react-toastify";
import app, { auth, firestore, storage } from "../util/firebase";
import { format } from "date-fns";
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import CustomDialog from "../components/CustomDialog";
import Map from "../components/Map";
import { Location } from "../models/Location";

type FormData = {
  name: string;
  surname: string;
  number: string;
  category: string;
  provider: boolean;
  location: Location;
};

const Setup = () => {
  const { isLoggedIn, currUser } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, getValues } =
    useForm<FormData>();
  const dbInstance = firestore.getFirestore(app);
  const storageInstance = storage.getStorage(app);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const imageInput = useRef<HTMLInputElement>();

  useEffect(() => {
    if (currUser !== undefined)
      if (!isLoggedIn()) router.replace("/");
      else if (currUser?.displayName !== null) router.replace("/LogedIn");
  }, [isLoggedIn, router, currUser]);

  const handleSetup = async (data: FormData) => {
    if (data.location === undefined) {
      toast.error("Niste postavili lokaciju!");
      return;
    }

    setLoading(true);
    firestore
      .setDoc(firestore.doc(dbInstance, `users`, `${currUser.uid}`), {
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        surname: data.surname.charAt(0).toUpperCase() + data.surname.slice(1),
        number: data.number,
        rating: null,
        reputation: null,
        membership: "silver",
        isProvider: data.provider,
        location: data.location,
        category: data.category ?? null,
        ad: { count: 0, permitted: 2 },
        adPromotion: { count: 0, permitted: 0 },
      })
      .then(() => {
        if (croppedImage) {
          const ref = storage.ref(
            storageInstance,
            `avatars/${currUser.uid}/${format(new Date(), "ddMMyyyy_HHmmss")}.${
              croppedImage.fileType
            }`
          );

          const uploadTask = storage.uploadBytesResumable(
            ref,
            croppedImage.file
          );

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
                    displayName:
                      data.name.charAt(0).toUpperCase() +
                      data.name.slice(1) +
                      " " +
                      data.surname.charAt(0).toUpperCase() +
                      data.surname.slice(1),
                    photoURL: url,
                  })
                  .then(() => {
                    setLoading(false);
                    window.URL.revokeObjectURL(croppedImage?.url);
                    router.replace("/");
                  });
              });
            }
          );
        } else {
          auth
            .updateProfile(currUser, {
              displayName:
                data.name.charAt(0).toUpperCase() +
                data.name.slice(1) +
                " " +
                data.surname.charAt(0).toUpperCase() +
                data.surname.slice(1),
            })
            .then(() => {
              setLoading(false);
              router.replace("/");
            });
        }
      })
      .catch((e) => console.error("Error adding document: " + e));
  };

  const handleErrors = (err) => {};

  // const getCurrLocation = () => {
  //   navigator.geolocation.getCurrentPosition(
  //     (res) => {
  //       setLocation(res);
  //       console.log(res.coords.latitude + " " + res.coords.longitude);
  //     },
  //     (err) => {
  //       if (err) {
  //         switch (err.code) {
  //           case err.PERMISSION_DENIED: {
  //             toast.error(
  //               "Kreiranje naloga za pruzaoca dobara/usluga nije moguce bez adrese!",
  //               { autoClose: false }
  //             );
  //           }
  //           case err.POSITION_UNAVAILABLE: {
  //             toast.error("Doslo je do greske prilikom lociranja", {
  //               autoClose: false,
  //             });
  //           }
  //         }
  //       }
  //     }
  //   );
  // };

  const [file, setFile] = useState<File>(null);
  const [photoURL, setURL] = useState("");
  const [croppedImage, setCroppedImage] = useState<ImageFileUrl>(null);

  const fileChosen = (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files[0];
    if (file) {
      if (file.type.indexOf("image") === -1) {
        toast.error("Fajl koji ste odabrali nije slika, pokusajte ponovo!");
        input.value = "";
        return;
      }
      setFile(file);
      setURL(window.URL.createObjectURL(file));
      window.URL.revokeObjectURL(croppedImage?.url);
      input.value = "";
    }
  };

  const removeAvatarPreview = () => {
    setCroppedImage(null);
    window.URL.revokeObjectURL(croppedImage.url);
  };

  const [mapDialog, setMapDialog] = useState(false);
  const [location, setLocation] = useState<Location>();

  const openMapDialog = () => {
    setMapDialog(true);
  };

  const closeMapDialog = (update?: boolean) => {
    if (update === true) setValue("location", location);
    setMapDialog(false);
  };

  return (
    <>
      <Container maxWidth="lg" className={styles.setupWrapper}>
        <Paper elevation={8} className={styles.paper}>
          <Typography variant="h6" marginY="1rem">
            Potrebno nam je jos par informacija pre nego sto pocnemo
          </Typography>
          <Box
            className={styles.form}
            component="form"
            onSubmit={handleSubmit(handleSetup, handleErrors)}
            noValidate
          >
            <TextField
              variant="outlined"
              label="Ime"
              {...register("name", { required: "Niste uneli Vase ime" })}
              required
              size="small"
            ></TextField>
            <TextField
              variant="outlined"
              label="Prezime"
              {...register("surname", { required: "Niste uneli Vase prezime" })}
              required
              size="small"
            ></TextField>
            <TextField
              variant="outlined"
              label="Telefon"
              {...register("number", {
                required: "Niste uneli Vase broj telefona",
              })}
              required
              size="small"
            ></TextField>

            <div className={styles.imageUpload}>
              {croppedImage ? (
                <>
                  {"Uklonite sliku"}
                  <CloseOutlinedIcon
                    onClick={() => {
                      removeAvatarPreview();
                    }}
                  />
                </>
              ) : (
                <>
                  <input
                    onChange={fileChosen}
                    type="file"
                    ref={imageInput}
                    hidden
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                  />
                  {"Postavite sliku"}
                  <FileUploadOutlinedIcon
                    onClick={() => {
                      imageInput.current.click();
                    }}
                  />
                </>
              )}
            </div>

            {croppedImage && (
              <Box className={styles.avatarPreview}>
                <Avatar
                  src={croppedImage?.url}
                  className={styles.avatar}
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
              </Box>
            )}
            <FormControlLabel
              control={<Switch {...register("provider")} />}
              label="Registrujem se kao pruzalac"
              style={{ justifyContent: "center" }}
            />
            {watch("provider") && (
              <>
                <FormControl size="small">
                  <InputLabel id="select-label">
                    Izaberite kategoriju
                  </InputLabel>
                  <Select
                    {...register("category", {
                      required:
                        "Niste postavili kategoriju za koju se registrujete",
                    })}
                    label="Izaberite kategoriju"
                    id="select-label"
                    value={watch("category") ?? ""}
                  >
                    <MenuItem value="products">Proizvodi</MenuItem>
                    <MenuItem value="services">Usluge</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  color="secondary"
                  endIcon={<MapOutlinedIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    openMapDialog();
                  }}
                  className={styles.MuiButton}
                >
                  Postavi lokaciju
                </Button>

                <CustomDialog // *Dialog for map
                  dialogOpen={mapDialog}
                  dialogClose={closeMapDialog}
                  contentText="Lokacija se moze postaviti ili automatski(mora biti odobreno) ili rucno postavljanjem markera na mapi duplim klikom"
                  title="Postavljanje lokacije"
                >
                  <Map
                    locationMarker={true}
                    setLocation={setLocation}
                    markerCords={location?.coords}
                  ></Map>
                </CustomDialog>
              </>
            )}
            <LoadingButton variant="contained" loading={loading} type="submit">
              Potvrdi
            </LoadingButton>
          </Box>
        </Paper>

        {/* <div className={styles.setup}>
          {croppedImage && (
            <div className={styles.imagePreview}>
              <Image src={croppedImage?.url} layout="fill" objectFit="cover" />
              <div>
                <MdOutlineCancel
                  onClick={() => {
                    setCroppedImage(null);
                    window.URL.revokeObjectURL(croppedImage.url);
                  }}
                />
              </div>
              {loading && (
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
              )}
            </div>
          )}
        </div> */}
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
    </>
  );
};

export default Setup;
