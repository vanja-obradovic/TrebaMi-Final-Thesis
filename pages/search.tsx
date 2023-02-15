import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  Container,
  Drawer,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
} from "@mui/material";
import { QuerySnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import AdCard from "../components/AdCard";
import styles from "../styles/search.module.scss";
import { useAuth } from "../contexts/AuthContext";
import { adSchema, adSchemaCard, Advertisement } from "../models/Advertisement";
import { getAdsAdvanced, getAdsByKeyword } from "../util/firebase";
import MenuIcon from "@mui/icons-material/Menu";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import Map from "../components/Map";
import useArray from "../hooks/useArray";
import useTimeout from "../hooks/useTimeout";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/router";

export const getServerSideProps = async ({ query, res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=119"
  );
  const calculatePriceRange = (prices): [number, number] => {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return [minPrice, maxPrice];
  };
  // console.log(query);
  if (query.keyword !== undefined) {
    const prices: number[] = [];
    const keyword = query.keyword;
    const allAds = await getAdsByKeyword(keyword).then((res) => {
      if (res instanceof QuerySnapshot)
        return res.docs.map((ad, index) => {
          const temp = adSchema.cast(ad.data());
          prices.push(temp.price);
          return { ...temp, link: ad.ref.path };
        });
      else return [];
    });
    return {
      props: { allAds: allAds, priceRange: calculatePriceRange(prices) },
    };
  } else {
    const prices: number[] = [];
    const { name, subcat, cat } = query;
    const allAds = await getAdsAdvanced(name, subcat, cat).then((res) => {
      if (res instanceof QuerySnapshot)
        return res.docs.map((ad, index) => {
          const temp = adSchema.cast(ad.data());
          prices.push(temp.price);
          return {
            ...temp,
            link: ad.ref.path,
          };
        });
      else return [];
    });
    return {
      props: { allAds: allAds, priceRange: calculatePriceRange(prices) },
    };
  }
};

const Search = ({
  allAds,
  priceRange,
}: {
  allAds: Advertisement[];
  priceRange: [number, number];
}) => {
  const { control, getValues } = useForm(); //*for municipalities
  const { currUser } = useAuth();
  const router = useRouter();
  const {
    control: priceControl,
    getValues: getSliderValue,
    setValue: setSliderValue,
  } = useForm();
  const {
    control: sortControl,
    watch: watchSort,
    getValues: getSort,
    setValue: setSort,
  } = useForm();
  const [drawer, toggleDrawer] = useState(false);
  const [drawerButton, setDrawerButton] = useState(false);
  const { isLoggedIn } = useAuth();
  const {
    array: ads,
    removePrimitiveDuplicates,
    set: setAds,
  } = useArray<Advertisement>(allAds);

  const [priceRangeClient, setPriceRange] =
    useState<[number, number]>(priceRange);

  useEffect(() => {
    if (currUser?.displayName === null) router.replace("/setup");

    if (window.innerWidth < 1280) setDrawerButton(true);
    const updateDrawer = () => {
      if (window.innerWidth > 1280) {
        setDrawerButton(false);
        toggleDrawer(false);
      } else setDrawerButton(true);
    };

    window.addEventListener("resize", updateDrawer);

    return () => window.removeEventListener("resize", updateDrawer);
  }, [currUser?.displayName]);

  const handleMunicipalityFilter = () => {
    if (Object.values(getValues()).every((val) => val === false)) {
      setAds(allAds);
      setPriceRange(priceRange);
      setSliderValue("priceRange", priceRange);
      setSort("sort", "");
    } else {
      const filtered = allAds.filter((item) =>
        getValues(item.provider.location.municipality)
      );
      setAds(filtered);
      const priceFilter = calculatePriceRange(
        filtered.map((item) => item.price)
      );
      setPriceRange(priceFilter);
      setSliderValue("priceRange", priceFilter);
      setSort("sort", "");
    }
  };

  const { reset: resetPriceRangeTimeout } = useTimeout(() => {
    setAds(
      allAds.filter(
        (item) =>
          item.price >= getSliderValue("priceRange.0") &&
          item.price <= getSliderValue("priceRange.1") &&
          (Object.values(getValues()).every((val) => val === false) ||
            getValues(item.provider.location.municipality))
      )
    );
    setSort("sort", "");
  }, 500);

  const handlePriceRangeFilter = () => {
    resetPriceRangeTimeout();
  };

  const handleSort = () => {
    switch (getSort("sort")) {
      case "priceAsc": {
        setAds(ads.sort((a, b) => a.price - b.price));
        break;
      }
      case "priceDesc": {
        setAds(ads.sort((a, b) => b.price - a.price));
        break;
      }
      case "ratingAsc": {
        setAds(ads.sort((a, b) => a.rating - b.rating));
        break;
      }
      case "ratingDesc": {
        setAds(ads.sort((a, b) => b.rating - a.rating));
        break;
      }
    }
  };

  const calculatePriceRange = (prices: number[]): [number, number] => {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return [minPrice, maxPrice];
  };

  // console.log(watch());

  return (
    <Container maxWidth={false} className={styles.outerContainer}>
      {allAds.length === 0 ? (
        <div className={styles.noContent}>
          <span>Nema oglasa za unete kriterijume pretrage</span>
          <Link href={"/"}>Idi nazad</Link>
        </div>
      ) : (
        <>
          <Paper className={styles.filter}>
            {drawerButton && (
              <Box className={styles.collapsed}>
                <Button onClick={() => toggleDrawer(true)}>
                  <MenuIcon />
                  Meni
                </Button>
                <FormControl classes={{ root: styles.formControl }}>
                  <InputLabel id="sort-label">Sortiraj po...</InputLabel>
                  <Controller
                    name="sort"
                    control={sortControl}
                    render={({ field: { onChange, ...props } }) => (
                      <Select
                        onChange={(e) => {
                          onChange(e.target.value);
                          handleSort();
                        }}
                        label="Sortiraj po..."
                        id="sort-label"
                        value={watchSort("sort") ?? ""}
                      >
                        <MenuItem value="priceAsc">Ceni rastuce</MenuItem>
                        <MenuItem value="priceDesc">Ceni opadajuce</MenuItem>
                        <MenuItem value="ratingAsc">Oceni rastuce</MenuItem>
                        <MenuItem value="ratingDesc">Oceni opadajuce</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Box>
            )}
            {!drawerButton && (
              <>
                <FormControl
                  component="fieldset"
                  variant="standard"
                  classes={{ root: styles.formControl }}
                >
                  <FormLabel component="legend" className={styles.formLabel}>
                    Opstina
                  </FormLabel>
                  <FormGroup classes={{ root: styles.formGroup }}>
                    {removePrimitiveDuplicates(
                      allAds.map((ad) => ad.provider.location.municipality)
                    ).map((item, index) => {
                      return (
                        <FormControlLabel
                          key={index}
                          control={
                            <Controller
                              name={item}
                              control={control}
                              defaultValue={false}
                              render={({ field: props }) => (
                                <Checkbox
                                  {...props}
                                  checked={!!props.value}
                                  onChange={(e) => {
                                    props.onChange(e.target.checked);
                                    handleMunicipalityFilter();
                                  }}
                                />
                              )}
                            />
                          }
                          label={item}
                        />
                      );
                    })}
                  </FormGroup>
                </FormControl>

                <FormControl classes={{ root: styles.formControl }}>
                  <FormLabel component="legend" className={styles.formLabel}>
                    Opseg cene
                  </FormLabel>
                  <Controller
                    name="priceRange"
                    control={priceControl}
                    defaultValue={priceRangeClient}
                    render={({ field: { onChange, ...props } }) => (
                      <Slider
                        {...props}
                        value={props.value}
                        onChange={(e, data) => {
                          onChange(data);
                          handlePriceRangeFilter();
                        }}
                        valueLabelDisplay={
                          priceRangeClient.every((item) => item === -1)
                            ? "off"
                            : "on"
                        }
                        min={priceRangeClient[0]}
                        max={priceRangeClient[1]}
                        classes={{
                          root: styles.slider,
                          valueLabel: styles.label,
                        }}
                        disabled={priceRangeClient[0] === priceRangeClient[1]}
                      />
                    )}
                  />
                  <FormHelperText className={styles.formHelperText}>
                    Promenom izbora opstine se resetuje filter cene
                  </FormHelperText>
                </FormControl>
                <FormControl classes={{ root: styles.formControl }}>
                  <InputLabel id="sort-label">Sortiraj po...</InputLabel>
                  <Controller
                    name="sort"
                    control={sortControl}
                    render={({ field: { onChange, ...props } }) => (
                      <Select
                        onChange={(e) => {
                          onChange(e.target.value);
                          handleSort();
                        }}
                        label="Sortiraj po..."
                        id="sort-label"
                        value={watchSort("sort") ?? ""}
                      >
                        <MenuItem value="priceAsc">Ceni rastuce</MenuItem>
                        <MenuItem value="priceDesc">Ceni opadajuce</MenuItem>
                        <MenuItem value="ratingAsc">Oceni rastuce</MenuItem>
                        <MenuItem value="ratingDesc">Oceni opadajuce</MenuItem>
                      </Select>
                    )}
                  />
                  {/* <FormHelperText className={styles.formHelperText}>
                Sortiranje se resetuje promenom filtera
              </FormHelperText> */}
                </FormControl>
                <Map
                  locationMarker={false}
                  markersWPopups={ads.map((ad) =>
                    adSchemaCard.cast(ad, { stripUnknown: true })
                  )}
                  disabled={!isLoggedIn()}
                ></Map>
              </>
            )}
          </Paper>

          <Drawer
            anchor="left"
            open={drawer}
            onClose={() => toggleDrawer(false)}
            hideBackdrop
            classes={{ paper: styles.drawer }}
          >
            <Button
              onClick={() => toggleDrawer(false)}
              variant="outlined"
              color="secondary"
              disableRipple
            >
              <ClearOutlinedIcon />
            </Button>
            <ClickAwayListener onClickAway={() => toggleDrawer(false)}>
              <div className={styles.drawerInner}>
                <FormControl
                  component="fieldset"
                  variant="filled"
                  classes={{ root: styles.formControl }}
                >
                  <FormLabel component="legend" className={styles.formLabel}>
                    Opstina
                  </FormLabel>
                  <FormGroup classes={{ root: styles.formGroup }}>
                    {removePrimitiveDuplicates(
                      allAds.map((ad) => ad.provider.location.municipality)
                    ).map((item, index) => {
                      return (
                        <FormControlLabel
                          key={index}
                          control={
                            <Controller
                              name={item}
                              control={control}
                              defaultValue={false}
                              render={({ field: props }) => (
                                <Checkbox
                                  {...props}
                                  checked={!!props.value}
                                  onChange={(e) => {
                                    props.onChange(e.target.checked);
                                    handleMunicipalityFilter();
                                  }}
                                />
                              )}
                            />
                          }
                          label={item}
                        />
                      );
                    })}
                  </FormGroup>
                </FormControl>
                <FormControl classes={{ root: styles.formControl }}>
                  <FormLabel component="legend" className={styles.formLabel}>
                    Opseg cene
                  </FormLabel>
                  <Controller
                    name="priceRange"
                    control={priceControl}
                    defaultValue={priceRangeClient}
                    render={({ field: { onChange, ...props } }) => (
                      <Slider
                        {...props}
                        value={props.value}
                        onChange={(e, data) => {
                          onChange(data);
                          handlePriceRangeFilter();
                        }}
                        valueLabelDisplay={
                          priceRangeClient.every((item) => item === -1)
                            ? "off"
                            : "on"
                        }
                        min={priceRangeClient[0]}
                        max={priceRangeClient[1]}
                        classes={{
                          root: styles.slider,
                          valueLabel: styles.label,
                        }}
                        disabled={priceRangeClient[0] === priceRangeClient[1]}
                      />
                    )}
                  />
                  <FormHelperText className={styles.formHelperText}>
                    Promenom izbora opstine se resetuje filter cene
                  </FormHelperText>
                </FormControl>
                <Map
                  locationMarker={false}
                  markersWPopups={ads.map((ad) =>
                    adSchemaCard.cast(ad, { stripUnknown: true })
                  )}
                  disabled={!isLoggedIn()}
                ></Map>
              </div>
            </ClickAwayListener>
          </Drawer>

          <Container maxWidth="lg" className={styles.innerContainer}>
            {ads.map((item, index) => {
              return (
                <AdCard
                  key={index}
                  // description={item.description}
                  // name={item.name}
                  // price={item.price}
                  // priceUnit={item.priceUnit}
                  // images={item.images}
                  // quantity={item.quantity}
                  // link={isLoggedIn() ? item.link : ""}
                  // subcategory={item.subcategory}
                  ad={adSchemaCard.cast(
                    { ...item, link: isLoggedIn() ? item.link : "" },
                    { stripUnknown: true }
                  )}
                  disabled={!isLoggedIn()}
                  // small={drawerButton}
                ></AdCard>
              );
            })}
          </Container>
        </>
      )}
    </Container>
  );
};

export default Search;
