import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { getAdsByKeyword, getAllAds } from "../util/firebase";
import { adSchema, Advertisement } from "../models/Advertisement";
import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import AdCard from "../components/AdCard";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import useArray from "../hooks/useArray";
import { QuerySnapshot } from "firebase/firestore";
import useDebounce from "../hooks/useDebounce";
import SearchIcon from "@mui/icons-material/Search";
import styles from "../styles/index.module.scss";

// export const getServerSideProps = async () => {
//   const allAds = await getAllAds().then((res) => {
//     return res.docs.map((ad, index) => {
//       const temp = adSchema.cast(ad.data());

//       return {
//         ...temp,
//         provider: {
//           ...temp.provider,
//           location: {
//             _long: temp.provider.location._long,
//             _lat: temp.provider.location._lat,
//           },
//         },
//         link: ad.ref.path,
//       };
//     });
//   });
//   return { props: { allAds: allAds } };
// };

export default function Home() {
  // allAds.forEach((ad) => {
  //   console.log(ad.name);
  // });

  const { register, handleSubmit } = useForm();
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
          (input.length > splitLen * 6 || split[splitLen - 1] === "")
        )
          return;
      }
      setFetching(true);
      const allAds = await getAdsByKeyword(input).then((res) => {
        if (res instanceof QuerySnapshot)
          return res.docs.map((ad) => {
            const tmp = adSchema.cast(ad.data());
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

  let loading = fetching || active;

  return (
    <>
      <Head>
        <title>Diplomski</title>
        <meta name="description" content="Graduation project at ETF" />
      </Head>

      <Box className={styles.firstHalf}>
        <Box>Vase omiljeno mesto za pronalazenje novih mesta za kupovinu</Box>
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
            isOptionEqualToValue={(option, value) => option.name === value.name}
            getOptionLabel={(option: Advertisement) => option.name ?? input}
            options={options}
            loading={loading}
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
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : (
                        <SearchIcon />
                      )}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            freeSolo
            clearOnEscape
            renderOption={(props, option) => (
              <AdCard
                {...option}
                key={option.link}
                search={true}
                small={true}
              ></AdCard>
            )}
          />
        </Box>
      </Box>
      <Box className={styles.secondHalf}>
        <Box bgcolor="GrayText">Dobra</Box>
        <Box bgcolor="Highlight">Usluge</Box>
      </Box>
    </>
  );
}
