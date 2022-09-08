import { useEffect, useState } from "react";
import Head from "next/head";
import { getAdsByKeyword } from "../util/firebase";
import {
  adSchema,
  Advertisement,
  productSubCategories,
  serviceSubCategories,
} from "../models/Advertisement";
import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  ClickAwayListener,
  TextField,
} from "@mui/material";
import AdCard from "../components/AdCard";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import useArray from "../hooks/useArray";
import { QuerySnapshot } from "firebase/firestore";
import useDebounce from "../hooks/useDebounce";
import SearchIcon from "@mui/icons-material/Search";

import styles from "../styles/index.module.scss";
import Image from "next/image";
import clay from "../public/clay.jpg";
import construction from "../public/construction.jpg";
import electrician from "../public/electrician.jpg";
import plumbing from "../public/plumbing.jpg";
import veg from "../public/veg.jpg";
import tex from "../public/tex.jpg";
import wood from "../public/wood.jpg";
import transport from "../public/transport.jpg";
import services from "../public/services.jpg";
import products from "../public/products.jpg";

type FormData = {
  subcategory: string;
  name: string;
};

export default function Home() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const {
    array: options,
    set: setOptions,
    clear,
  } = useArray<Advertisement>([]);
  const [input, setInput] = useState("");

  const active = useDebounce(
    async () => {
      if (input) {
        if (input.length < 3) return;
        const split = input.split(" ");
        const splitLen = split.length;
        if (
          options.length &&
          (input.length > splitLen * 5 || split[splitLen - 1] === "")
        )
          return;
      }
      setFetching(true);
      const allAds = await getAdsByKeyword(input).then((res) => {
        if (res instanceof QuerySnapshot)
          return res.docs.map((ad) => {
            const tmp = adSchema.cast(ad.data(), { stripUnknown: true });
            return { ...tmp, link: ad.ref.path };
          });
        else return [];
      });
      setOptions(allAds);
      setFetching(false);
    },
    400,
    [input]
  );

  const [focusProducts, setFocusProducts] = useState(false);
  const [focusServices, setFocusServices] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [loading, setLoading] = useState(false);

  let loadingResults = fetching || active;

  useEffect(() => {
    if (window.innerWidth > 1280) setInteractive(true);
    const updateInteractivity = () => {
      if (window.innerWidth > 1280) setInteractive(true);
      else setInteractive(false);
    };

    window.addEventListener("resize", updateInteractivity);

    // setTimeout(() => {
    //   setLoading(false);
    // }, 500);

    return () => window.removeEventListener("resize", updateInteractivity);
  }, []);

  const { control, register, handleSubmit } = useForm<FormData>({
    shouldUnregister: true,
  });

  return (
    <>
      <Head>
        <title>Diplomski</title>
        <meta name="description" content="Graduation project at ETF" />
      </Head>

      <Backdrop
        sx={{
          backgroundColor: "rgba(255,255,255,0.75)!important",
          zIndex: 99999,
        }}
        open={loading}
        transitionDuration={{ appear: 0, enter: 0, exit: 1500 }}
      >
        <CircularProgress
          color="primary"
          sx={{ width: "5rem!important", height: "5rem!important" }}
        />
      </Backdrop>
      {!loading && (
        <>
          <Box className={styles.firstHalf}>
            <Box>Vase omiljeno mesto za ono sto vam treba, gde god da ste</Box>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                router.push({ pathname: "/search", query: { keyword: input } });
              }}
              className={styles.searchWrapper}
            >
              <Autocomplete
                disablePortal
                id="search"
                className={styles.search}
                classes={{ listbox: styles.list }}
                open={open}
                onOpen={() => {
                  setOpen(true);
                }}
                onClose={() => {
                  setOpen(false);
                  clear();
                }}
                isOptionEqualToValue={(option, value) =>
                  option.name === value.name
                }
                getOptionLabel={(option: Advertisement) => option.name ?? input}
                options={options}
                loading={loadingResults}
                loadingText={"Ucitava se ..."}
                defaultValue={null}
                inputValue={input}
                onInputChange={(e, input) => {
                  setInput(input);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pretrazite..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingResults ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : (
                            <SearchIcon />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                      className: styles.inputStyle,
                    }}
                    InputLabelProps={{ className: styles.inputStyle }}
                  />
                )}
                freeSolo
                clearOnEscape
                renderOption={(props, option) => (
                  <AdCard
                    ad={option}
                    key={option.link}
                    search={true}
                    small={true}
                  ></AdCard>
                )}
              />
            </Box>
            <p>
              Klikom na neku od kategorija ispod otvara se meni za detaljniju
              pretragu te kategorije
            </p>
          </Box>
          <Box className={styles.secondHalf}>
            <ClickAwayListener
              onClickAway={() => {
                setFocusProducts(false);
                console.log("blur");
              }}
            >
              <Box
                component="div"
                className={styles.products}
                onFocus={() => {
                  setFocusProducts(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && e.target.localName === "div") {
                    e.target.blur();
                    setFocusProducts(false);
                  }
                }}
                tabIndex={-2}
              >
                {!focusProducts ? (
                  interactive ? (
                    <div className={styles.productsInteractive}>
                      <div className={styles.first}>
                        <div>
                          <Image
                            src={veg}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="food"
                          ></Image>
                        </div>
                        {/* <img src="./veg.jpg"></img> */}
                      </div>
                      <div className={styles.second}>
                        <div>
                          <Image
                            src={wood}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="wood"
                          ></Image>
                        </div>
                        {/* <img src="./wood.jpg"></img> */}
                      </div>
                      <div className={styles.third}>
                        <div>
                          <Image
                            src={clay}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="clay"
                          ></Image>
                        </div>
                        {/* <img src="./clay.jpg"></img> */}
                      </div>
                      <div className={styles.fourth}>
                        <div>
                          <Image
                            src={tex}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="textile"
                          ></Image>
                        </div>
                        {/* <img src="./tex.jpg"></img> */}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.productsBasic}>
                      {/* <img src="./products.jpg" alt="" placeholder="blur" /> */}
                      <div>
                        <Image
                          src={products}
                          layout="fill"
                          placeholder="blur"
                          priority
                          alt="products"
                        ></Image>
                      </div>
                    </div>
                  )
                ) : (
                  <Box
                    component="form"
                    onSubmit={handleSubmit((data: FormData) => {
                      setLoading(true);
                      router.push({
                        pathname: "/search",
                        query: {
                          subcat: data.subcategory,
                          name: data.name,
                          cat: "products",
                        },
                      });
                    })}
                  >
                    <Controller
                      name="subcategory"
                      control={control}
                      render={({ field: { onChange, ...props } }) => (
                        <Autocomplete
                          {...props}
                          disablePortal
                          id="combo-box-demo"
                          options={productSubCategories}
                          onChange={(e, data) => onChange(data)}
                          renderInput={(params) => (
                            <TextField {...params} label="Podkategorija" />
                          )}
                        />
                      )}
                    />
                    <TextField
                      label="Ime ili puno ime"
                      {...register("name")}
                    ></TextField>

                    <Button type="submit" variant="contained">
                      Ok
                    </Button>
                  </Box>
                )}
              </Box>
            </ClickAwayListener>
            <ClickAwayListener
              onClickAway={() => {
                setFocusServices(false);
                console.log("blur");
              }}
            >
              <Box
                className={styles.services}
                onFocus={(e) => {
                  console.log("focus");
                  setFocusServices(true);
                }}
                onKeyDown={(e) => {
                  console.log(e);
                  if (e.key === "Escape" && e.target.localName === "div") {
                    e.target.blur();
                    setFocusServices(false);
                    console.log("blur");
                  }
                }}
                tabIndex={-1}
              >
                {!focusServices ? (
                  interactive ? (
                    <div className={styles.servicesInteractive}>
                      <div className={styles.first}>
                        <div>
                          <Image
                            src={construction}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="construction"
                          ></Image>
                        </div>
                        {/* <img src="./construction.jpg"></img> */}
                      </div>
                      <div className={styles.second}>
                        <div>
                          <Image
                            src={transport}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="transport"
                          ></Image>
                        </div>
                        {/* <img src="./transport.jpg"></img> */}
                      </div>
                      <div className={styles.third}>
                        <div>
                          <Image
                            src={electrician}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="electrician"
                          ></Image>
                        </div>
                        {/* <img src="./electrician.jpg"></img> */}
                      </div>
                      <div className={styles.fourth}>
                        <div>
                          <Image
                            src={plumbing}
                            layout="fill"
                            placeholder="blur"
                            priority
                            alt="plumbing"
                          ></Image>
                        </div>
                        {/* <img src="./plumbing.jpg"></img> */}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.servicesBasic}>
                      {/* <img src="./services.jpg" alt="" placeholder="blur" /> */}
                      <div>
                        <Image
                          src={services}
                          layout="fill"
                          placeholder="blur"
                          priority
                          alt="services"
                        ></Image>
                      </div>
                    </div>
                  )
                ) : (
                  <Box
                    component="form"
                    onSubmit={handleSubmit((data: FormData) => {
                      setLoading(true);
                      router.push({
                        pathname: "/search",
                        query: {
                          subcat: data.subcategory,
                          name: data.name,
                          cat: "services",
                        },
                      });
                    })}
                  >
                    <Controller
                      name="subcategory"
                      control={control}
                      render={({ field: { onChange, ...props } }) => (
                        <Autocomplete
                          {...props}
                          disablePortal
                          id="combo-box-demo"
                          options={serviceSubCategories}
                          onChange={(e, data) => onChange(data)}
                          renderInput={(params) => (
                            <TextField {...params} label="Podkategorija" />
                          )}
                        />
                      )}
                    />
                    <TextField
                      label="Ime ili puno ime"
                      {...register("name")}
                    ></TextField>

                    <Button type="submit" variant="contained">
                      Ok
                    </Button>
                  </Box>
                )}
              </Box>
            </ClickAwayListener>
          </Box>
        </>
      )}
    </>
  );
}
