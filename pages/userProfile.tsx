import { Box, Container } from "@mui/system";

import {
  doc,
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import AuthCheck from "../components/AuthCheck";
import { useAuth } from "../contexts/AuthContext";
import app, { firestore, getUser, getUserAds, storage } from "../util/firebase";
import styles from "../styles/userProfile.module.scss";
import {
  Autocomplete,
  Avatar,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Link from "next/link";
import TabPanel from "../components/TabPanel";
import { adSchemaCard } from "../models/Advertisement";
import CustomDialog from "../components/CustomDialog";
import CustomStepper from "../components/CustomStepper";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import GalleryCropper from "../components/ImgCropperWGallery";
import { ImageFileUrl } from "../util/imageCropper";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import AdCard from "../components/AdCard";
import UserDetails from "../components/UserDetails";
import { ngram } from "../util/ngram";
import useArray from "../hooks/useArray";

type adFormData = {
  name: string;
  description: string;
  price: number;
  quantity?: number;
  subcategory: string;
  priceUnit: string;
};

const UserDashboard = () => {
  const { currUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    control,
    watch,
  } = useForm<adFormData>({
    mode: "onBlur",
    defaultValues: {
      subcategory: null,
      quantity: 1,
      price: 0,
      priceUnit: "rsd",
    },
  });

  const [userProfile, setUserProfile] = useState<DocumentData>();
  const [adRef, setAdRef] = useState<DocumentReference>();
  const [userAds, setUserAds] =
    useState<QueryDocumentSnapshot<DocumentData>[]>();

  const dbInstance = firestore.getFirestore(app);
  const storageInstance = storage.getStorage(app);

  const [tabValue, setTabValue] = useState(0);

  const tabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const [newAdDialog, setNewAdDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const newAdDialogOpen = () => {
    setNewAdDialog(true);
  };
  const newAdDialogClose = (state?: boolean) => {
    setNewAdDialog(false);
  };

  const productSubCategories = ["Hrana", "Tekstil", "Koza", "Drvo", "Hemija"];
  const serviceSubCategories = [
    "Ugostiteljstvo",
    "Transport",
    "Gradjevinarstvo",
  ];

  useEffect(() => {
    const getUserDoc = async () => {
      const userDoc = await getUser(currUser?.uid);
      setUserProfile(userDoc.data());
      const userAds = await getUserAds(currUser?.uid);
      setUserAds(userAds.docs);
    };

    getUserDoc();
  }, [currUser?.uid]);

  const adSubmitHandler = (data: adFormData) => {
    const adCollection = firestore.collection(
      dbInstance,
      `users/${currUser?.uid}/ads`
    );
    const userDoc = firestore.doc(dbInstance, `users/${currUser?.uid}`);
    toast.promise(
      firestore
        .addDoc(adCollection, {
          name: data.name,
          description: data.description,
          price:
            userProfile?.category === "products" ? data.price : "Po dogovoru",
          quantity: userProfile?.category === "products" ? data.quantity : null,
          subcategory: data.subcategory,
          provider: {
            location: userProfile?.location,
            displayName: currUser?.displayName,
            photoURL: currUser?.photoURL,
          },
          priceUnit: userProfile?.category === "products" ? data.priceUnit : "",
          keywords: ngram(data.name, 3),
        })
        .then(async (docRef) => {
          setAdRef(docRef);
          await firestore.updateDoc(userDoc, {
            "ad.count": firestore.increment(1),
          });
        }),
      {
        success: "Oglas uspesno dodat!",
        pending: "Dodavanje u toku...",
        error: "Greska pri dodavanju oglasa!",
      }
    );
  };

  const adErrorHandler = (err) => {
    if (err.name) toast.error(err.name.message, { autoClose: 2500 });
    if (err.description)
      toast.error(err.description.message, { autoClose: 2500 });
    if (err.price) toast.error(err.price.message, { autoClose: 2500 });
    if (err.subcategory)
      toast.error(err.subcategory.message, { autoClose: 2500 });
  };

  const buttonRef = useRef<HTMLButtonElement>();

  const imageInput = useRef<HTMLInputElement>();
  const [photoURLs, setPhotoURLs] = useState<string[]>([]);
  // const [croppedImages, setCroppedImage] = useState<ImageFileUrl[]>([]);
  const {
    array: croppedImages,
    set: setCroppedImages,
    remove: removeImage,
  } = useArray<ImageFileUrl>([]);

  const fileChosen = (e) => {
    const input = e.target as HTMLInputElement;
    const fileArr = input.files;
    if (fileArr) {
      for (const file of fileArr) {
        setPhotoURLs((prev) => [...prev, window.URL.createObjectURL(file)]);
      }
      // window.URL.revokeObjectURL(croppedImage?.url); //!moraju svi da se revokeuju
      input.value = "";
    }
  };

  const imageAsPromise = (baseRef, adRef, image: ImageFileUrl) => {
    const ref = storage.ref(baseRef, `${adRef}/${uuidv4()}.${image.fileType}`);
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

  const uploadImages = () => {
    const promises = [];
    if (!!croppedImages.length) {
      const ref = storage.ref(storageInstance, `user/${currUser.uid}`);

      for (const image of croppedImages) {
        promises.push(imageAsPromise(ref, adRef.id, image));
      }

      toast.promise(
        Promise.all(promises).then((urls) => {
          firestore.updateDoc(adRef, { images: urls });
          console.log(urls);
        }),
        { success: "Jupi", pending: "U toku...", error: "Greska" }
      );
    } else {
      firestore.updateDoc(adRef, { images: [] });
    }
  };

  return (
    <AuthCheck>
      <Container component="div" maxWidth="xl" className={styles.container}>
        <Paper elevation={4} className={styles.wrapper}>
          <UserDetails
            displayName={currUser?.displayName}
            membership={userProfile?.membership}
            photoURL={currUser?.photoURL}
            rating={userProfile?.rating}
            reputation={userProfile?.reputation}
          ></UserDetails>
          <Box className={styles.economy}>
            <Paper elevation={4} className={styles.paper}>
              <Tabs
                value={tabValue}
                onChange={tabChange}
                variant="scrollable"
                scrollButtons="auto"
                classes={{ indicator: "indicator" }}
                TabIndicatorProps={{ children: <span></span> }}
              >
                <Tab label="Dashboard" classes={{ root: styles.tabs }} />
                <Tab label="Moji oglasi" classes={{ root: styles.tabs }} />
                <Tab label="Poruke" classes={{ root: styles.tabs }} />
                <Tab label="Moje kupovine" classes={{ root: styles.tabs }} />
              </Tabs>
              <hr style={{ border: "1px solid #e8e8e8" }} />

              <TabPanel value={tabValue} index={0}>
                Item One
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                {userProfile?.ad.count !== userProfile?.ad.permitted && (
                  <Paper elevation={2} className={styles.actions}>
                    <Button onClick={() => newAdDialogOpen()}>
                      <AddOutlinedIcon />
                      <span> Dodaj oglas</span>
                    </Button>

                    <CustomDialog
                      title="Dodavanje novog oglasa"
                      dialogClose={newAdDialogClose}
                      dialogOpen={newAdDialog}
                      dialogLoading={dialogLoading}
                      isStepperDialog={true} //TODO srediti ovo kako treba
                    >
                      <CustomStepper
                        titles={[
                          { title: "Podaci", submitBtn: buttonRef },
                          {
                            title: "Slike",
                            optional: true,
                            action: uploadImages,
                          },
                        ]}
                        canTransition={isValid}
                      >
                        <Box
                          component="form"
                          className={styles.newAdForm}
                          noValidate
                          onKeyDown={(e) => {
                            e.key === "Enter" && e.preventDefault();
                          }}
                        >
                          <TextField
                            variant="outlined"
                            label="Naziv"
                            type="text"
                            required
                            {...register("name", {
                              required: "Morate uneti naziv oglasa",
                              minLength: {
                                value: 3,
                                message:
                                  "Naziv ne moze imati manje od 3 karaktera",
                              },
                              maxLength: {
                                value: 30,
                                message:
                                  "Naziv ne moze imati vise od 30 karaktera",
                              },
                            })}
                          ></TextField>
                          <TextField
                            variant="outlined"
                            label="Opis"
                            required
                            multiline
                            minRows={5}
                            {...register("description", {
                              required: "Morate uneti opis",
                              minLength: {
                                value: 25,
                                message:
                                  "Opis ne moze imati manje od 25 karaktera",
                              },
                            })}
                            type="text"
                          ></TextField>
                          {userProfile?.category === "products" ? (
                            <>
                              <div>
                                <TextField
                                  variant="outlined"
                                  label="Cena"
                                  type="number"
                                  required
                                  {...register("price", {
                                    required: "Morate uneti cenu",
                                  })}
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        {watch("priceUnit")}
                                      </InputAdornment>
                                    ),
                                  }}
                                ></TextField>
                                <FormControl>
                                  <InputLabel id="priceUnit">
                                    Jedinica
                                  </InputLabel>
                                  <Select
                                    labelId="priceUnit"
                                    id="priceUnit"
                                    {...register("priceUnit")}
                                    label="Jedinica"
                                    value={watch("priceUnit")}
                                  >
                                    <MenuItem value="rsd">rsd</MenuItem>
                                    <MenuItem value="rsd/kg">rsd/kg</MenuItem>
                                    <MenuItem value="rsd/g">rsd/g</MenuItem>
                                  </Select>
                                </FormControl>
                              </div>
                              <TextField
                                variant="outlined"
                                label="Kolicina"
                                type="number"
                                required
                                {...register("quantity", {
                                  required: "Morate uneti kolicinu",
                                })}
                              ></TextField>
                            </>
                          ) : (
                            <TextField
                              variant="outlined"
                              label="Cena"
                              type="text"
                              disabled
                              {...register("price")}
                              InputLabelProps={{ shrink: true }}
                              value="Po dogovoru"
                            ></TextField>
                          )}
                          <Controller
                            name="subcategory"
                            control={control}
                            rules={{ required: "Morate uneti podkategoriju" }}
                            render={({ field: { onChange, ...props } }) => (
                              <Autocomplete
                                {...props}
                                disablePortal
                                id="combo-box-demo"
                                options={
                                  userProfile?.category === "products"
                                    ? productSubCategories
                                    : serviceSubCategories
                                }
                                onChange={(e, data) => onChange(data)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Podkategorija"
                                    required
                                  />
                                )}
                              />
                            )}
                          />
                          <button
                            hidden
                            ref={buttonRef}
                            onClick={handleSubmit(
                              adSubmitHandler,
                              adErrorHandler
                            )}
                          ></button>
                        </Box>
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
                                <Box
                                  key={index}
                                  className={styles.imageWrapper}
                                >
                                  <Image
                                    key={index}
                                    src={img.url}
                                    layout="fill"
                                  ></Image>
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
                      </CustomStepper>
                    </CustomDialog>
                  </Paper>
                )}

                {userAds?.map((item, index) => {
                  return (
                    <AdCard
                      {...adSchemaCard.cast(item.data())}
                      key={index}
                      link={item.ref.path}
                    />
                  );
                })}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                Item Three
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                Item four
              </TabPanel>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </AuthCheck>
  );
};

export default UserDashboard;
