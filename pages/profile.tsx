import { Box, Container } from "@mui/system";
import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import React, { useEffect, useReducer, useRef, useState } from "react";
import AuthCheck from "../components/AuthCheck";
import { useAuth } from "../contexts/AuthContext";
import app, {
  firestore,
  getUser,
  getUserAds,
  getUserChats,
  getUserFavourites,
  getUserReceipts,
  storage,
} from "../util/firebase";
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
  Tooltip,
} from "@mui/material";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TabPanel from "../components/TabPanel";
import {
  adSchemaCard,
  productSubCategories,
  serviceSubCategories,
} from "../models/Advertisement";
import CustomDialog from "../components/CustomDialog";
import CustomStepper from "../components/CustomStepper";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import GalleryCropper from "../components/ImgCropperWGallery";
import ChatCard from "../components/ChatCard";
import { ImageFileUrl } from "../util/imageCropper";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import AdCard from "../components/AdCard";
import UserDetails from "../components/UserDetails";
import { ngram } from "../util/ngram";
import useArray from "../hooks/useArray";
import { Receipt } from "../models/Receipt";
import AdReceipt from "../components/AdReceipt";
import { User, userSchema } from "../models/User";
import { Chat, chatSchema } from "../models/Chat";
import PieChart from "../components/PieChart";
import { isSameMonth } from "date-fns";
import Link from "next/link";

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
    shouldUnregister: true,
  });

  const [userProfile, setUserProfile] = useState<User>();
  const [adRef, setAdRef] = useState<DocumentReference>();
  const [userAds, setUserAds] =
    useState<QueryDocumentSnapshot<DocumentData>[]>();
  const [userPurchases, setUserPurchases] = useState<Receipt[]>();
  const [userSales, setUserSales] = useState<Receipt[]>();
  const [userChats, setUserChats] = useState<Chat[]>();
  const [monthPurchases, setMonthPurchases] = useState<Receipt[]>([]);
  const [monthSales, setMonthSales] = useState<Receipt[]>([]);
  const [subCatSpending, setSubCatSpending] = useState<{
    labels: string[];
    data: number[];
  }>();
  const [subCatEarnings, setSubCatEarnings] = useState<{
    labels: string[];
    data: number[];
  }>();
  const [favourites, setFavourites] = useState([]);

  const dbInstance = firestore.getFirestore(app);
  const storageInstance = storage.getStorage(app);

  const [tabValue, setTabValue] = useState(0);
  const [update, forceUpdate] = useReducer((x) => x + 1, 0);

  const tabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // const favourites = {};

  useEffect(() => {
    const currentDate = new Date().getTime();
    getUserReceipts(currUser?.uid, "purchases").then((res) => {
      setUserPurchases(res);
      setMonthPurchases(
        res.filter(
          (item) => isSameMonth(currentDate, item.timestamp) && item.completed
        )
      );
      setSubCatSpending(getSubcatStatistic(res));
    });
    getUserReceipts(currUser?.uid, "sales").then((res) => {
      setUserSales(res);
      setMonthSales(
        res.filter(
          (item) => isSameMonth(currentDate, item.timestamp) && item.completed
        )
      );
      setSubCatEarnings(getSubcatStatistic(res));
    });

    if (tabValue === 2)
      getUserChats({
        uid: currUser?.uid,
        displayName: currUser?.displayName,
        photoURL: currUser?.photoURL,
      }).then((res) => {
        console.log(res);
        setUserChats(res);
      });
  }, [tabValue, update, currUser?.uid]);

  useEffect(() => {
    const joined = userPurchases?.concat(userSales);
    console.log(joined);
    if (joined?.length > 0) getFavourites(joined);
  }, [userSales, userPurchases]);

  const [newAdDialog, setNewAdDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const newAdDialogOpen = () => {
    setNewAdDialog(true);
  };
  const newAdDialogClose = (state?: boolean) => {
    setNewAdDialog(false);
  };

  useEffect(() => {
    const getUserDoc = async () => {
      const userDoc = await getUser(currUser?.uid);
      setUserProfile(userSchema.cast(userDoc.data()));
      const userAds = await getUserAds(currUser?.uid);
      setUserAds(userAds.docs);
    };

    getUserDoc();
  }, [currUser?.uid, update]);

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
          price: userProfile?.category === "products" ? data.price : -1,
          quantity: userProfile?.category === "products" ? data.quantity : null,
          subcategory: data.subcategory,
          category: userProfile?.category,
          rating: null,
          provider: {
            location: userProfile?.location,
            displayName: currUser?.displayName,
            photoURL: currUser?.photoURL,
          },
          pendingUsers: [],
          priceUnit: userProfile?.category === "products" ? data.priceUnit : "",
          keywords: ngram(data.name, 3),
        })
        .then(async (docRef) => {
          setAdRef(docRef);
          await firestore
            .updateDoc(userDoc, {
              "ad.count": firestore.increment(1),
            })
            .then(() => forceUpdate());
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
        {
          success: "Uspeh!",
          pending: "U toku...",
          error: "Greska, pokusajte ponovo",
        }
      );
    } else {
      firestore.updateDoc(adRef, { images: [] });
    }
  };

  const getMonthFlow = () => {
    const spendings = monthPurchases?.reduce(
      (prev, curr) => prev + curr.amount * curr.quantity,
      0
    );
    const earnings = monthSales?.reduce(
      (prev, curr) => prev + curr.amount * curr.quantity,
      0
    );
    return [spendings, earnings];
  };

  const getSubcatStatistic = (input) => {
    const reduced = input?.reduce((arr, curr) => {
      if (curr.completed)
        arr[curr.subcategory] =
          (arr[curr.subcategory] || 0) + curr.amount * curr.quantity;
      return arr;
    }, {});

    const labels = [];
    const data = Object.entries(reduced).map((item) => {
      labels.push(item[0]);
      return item[1] as number;
    });

    return { labels: labels, data: data };
  };

  const getFavourites = (arr: Receipt[]) => {
    const reduced: any = arr.reduce((output, curr) => {
      output[curr.sellerID] = (output[curr.sellerID] || 0) + 1;
      return output;
    }, {});

    getUserFavourites(
      Object.entries(reduced)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .flatMap((item) => item[0])
    ).then((res) => setFavourites(res));
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
          <Box className={styles.tabWrapper}>
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

                {userProfile?.isProvider && (
                  <Tab label="Moji oglasi" classes={{ root: styles.tabs }} />
                )}
                <Tab label="Poruke" classes={{ root: styles.tabs }} />
                <Tab label="Moje kupovine" classes={{ root: styles.tabs }} />
                {userProfile?.isProvider && (
                  <Tab label="Moje prodaje" classes={{ root: styles.tabs }} />
                )}
              </Tabs>
              <hr style={{ border: "1px solid #e8e8e8" }} />

              <TabPanel value={tabValue} index={0}>
                <Container maxWidth="md" className={styles.dashboard}>
                  <Container maxWidth="md" className={styles.economy}>
                    {userProfile?.isProvider && (
                      <Box>
                        <PieChart
                          dataset={{
                            labels: ["Raspolozivo", "Iskorisceno"],
                            data: [
                              userProfile?.ad.permitted - userProfile?.ad.count,
                              userProfile?.ad.count,
                            ],
                            title: "Raspolozivi/iskorisceni oglasi",
                          }}
                        ></PieChart>
                      </Box>
                    )}
                    {userProfile?.adPromotion.permitted !== 0 &&
                      userProfile?.isProvider && (
                        <Box>
                          <PieChart
                            dataset={{
                              labels: ["Raspolozivo", "Iskorisceno"],
                              data: [
                                userProfile?.adPromotion.permitted -
                                  userProfile?.adPromotion.count,
                                userProfile?.adPromotion.count,
                              ],
                              title: "Raspolozive/iskoriscene promocije",
                            }}
                          ></PieChart>
                        </Box>
                      )}
                    {monthPurchases.length > 0 && monthSales.length > 0 ? (
                      <>
                        <Box>
                          <PieChart
                            dataset={{
                              labels: ["Kupovine", "Prodaje"],
                              data: [monthPurchases.length, monthSales.length],
                              title: "Kupovina/prodaja ovog meseca",
                            }}
                          ></PieChart>
                        </Box>
                        <Box>
                          <PieChart
                            dataset={{
                              labels: ["Rashodi", "Prihodi"],
                              data: getMonthFlow(),
                              title: "Rashodi/prihodi ovog meseca",
                            }}
                          ></PieChart>
                        </Box>
                      </>
                    ) : (
                      !userProfile?.isProvider && (
                        <span className={styles.noData}>Nema podataka</span>
                      )
                    )}
                    {subCatSpending?.data.length > 0 && (
                      <Box>
                        <PieChart
                          dataset={{
                            data: subCatSpending?.data ?? [],
                            labels: subCatSpending?.labels ?? [],
                            title: "Rashodi po podkategoriji",
                          }}
                        ></PieChart>
                      </Box>
                    )}
                    {userProfile?.isProvider &&
                      subCatEarnings?.data.length > 0 && (
                        <Box>
                          <PieChart
                            dataset={{
                              data: subCatEarnings?.data ?? [],
                              labels: subCatEarnings?.labels ?? [],
                              title: "Prihodi po podkategoriji",
                            }}
                          ></PieChart>
                        </Box>
                      )}
                  </Container>
                  <Container maxWidth="md" className={styles.favourites}>
                    <h3>Top 3 korisnika po broju saradnji:</h3>
                    <Container maxWidth="xl">
                      {favourites?.map((item) => {
                        return (
                          <Link
                            href={{
                              pathname: "/user",
                              query: { id: item.uid },
                            }}
                            key={item.uid}
                          >
                            <Tooltip
                              title={item.displayName}
                              arrow
                              sx={{ cursor: "pointer" }}
                            >
                              <Avatar src={item.photoURL}>
                                {item.displayName.charAt(0)}
                              </Avatar>
                            </Tooltip>
                          </Link>
                        );
                      })}
                    </Container>
                  </Container>
                </Container>
              </TabPanel>
              {userProfile?.isProvider && (
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
                                  value: 25,
                                  message:
                                    "Naziv ne moze imati vise od 25 karaktera",
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
                                <div className={styles.priceUnit}>
                                  <TextField
                                    variant="outlined"
                                    label="Cena"
                                    type="number"
                                    required
                                    {...register("price", {
                                      required: "Morate uneti cenu",
                                      valueAsNumber: true,
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
                                    valueAsNumber: true,
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
                        ad={adSchemaCard.cast(
                          { ...item.data(), link: item.ref.path },
                          {
                            stripUnknown: true,
                          }
                        )}
                        key={index}
                      />
                    );
                  })}
                </TabPanel>
              )}
              <TabPanel value={tabValue} index={2}>
                <h3>Poruke</h3>
                <Container maxWidth="md">
                  {userChats?.map((chat) => {
                    return <ChatCard {...chat} key={chat.id}></ChatCard>;
                  })}
                </Container>
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                <Container maxWidth="lg" className={styles.receiptContainer}>
                  {userPurchases?.map((item, index) => {
                    if (item) {
                      return (
                        <AdReceipt
                          key={index}
                          props={item}
                          type="purchases"
                          refetch={forceUpdate}
                        ></AdReceipt>
                      );
                    }
                  })}
                </Container>
              </TabPanel>
              {userProfile?.isProvider && (
                <TabPanel value={tabValue} index={4}>
                  <Container maxWidth="lg" className={styles.receiptContainer}>
                    {userSales?.map((item, index) => {
                      if (item) {
                        return (
                          <AdReceipt
                            key={index}
                            props={item}
                            type="sales"
                            refetch={forceUpdate}
                          ></AdReceipt>
                        );
                      }
                    })}
                  </Container>
                </TabPanel>
              )}
            </Paper>
          </Box>
        </Paper>
      </Container>
    </AuthCheck>
  );
};

export default UserDashboard;
