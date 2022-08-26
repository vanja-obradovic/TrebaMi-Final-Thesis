import {
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
} from "@mui/material";
import { QuerySnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import AdCard from "../components/AdCard";
import styles from "../styles/search.module.scss";
import { useAuth } from "../contexts/AuthContext";
import { adSchema, Advertisement } from "../models/Advertisement";
import { getAdsAdvanced, getAdsByKeyword } from "../util/firebase";
import MenuIcon from "@mui/icons-material/Menu";

export const getServerSideProps = async ({ query }) => {
  if (query.keyword) {
    const keyword = query.keyword;
    const allAds = await getAdsByKeyword(keyword).then((res) => {
      if (res instanceof QuerySnapshot)
        return res.docs.map((ad, index) => {
          const temp = adSchema.cast(ad.data());

          return {
            ...temp,
            provider: {
              ...temp.provider,
              location: {
                _long: temp.provider.location._long,
                _lat: temp.provider.location._lat,
              },
            },
            link: ad.ref.path,
          };
        });
      else return [];
    });
    return { props: { allAds: allAds } };
  } else {
    const { name, subcat, cat } = query;
    const allAds = await getAdsAdvanced(name, subcat, cat).then((res) => {
      if (res instanceof QuerySnapshot)
        return res.docs.map((ad, index) => {
          const temp = adSchema.cast(ad.data());

          return {
            ...temp,
            provider: {
              ...temp.provider,
              location: {
                _long: temp.provider.location._long,
                _lat: temp.provider.location._lat,
              },
            },
            link: ad.ref.path,
          };
        });
      else return [];
    });
    return { props: { allAds: allAds } };
  }
};

const Search = ({ allAds }: { allAds: Advertisement[] }) => {
  const [drawer, toggleDrawer] = useState(false);
  const [drawerButton, setDrawerButton] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (window.innerWidth < 1280) setDrawerButton(true);
    const updateDrawer = () => {
      if (window.innerWidth > 1280) setDrawerButton(false);
      else setDrawerButton(true);
    };

    window.addEventListener("resize", updateDrawer);

    return () => window.removeEventListener("resize", updateDrawer);
  }, []);

  return (
    <Container maxWidth="xl" className={styles.outerContainer}>
      <Box>
        {drawerButton && (
          <Button onClick={() => toggleDrawer(true)}>
            <MenuIcon />
            Otvori filtere
          </Button>
        )}
        {!drawerButton && (
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Proba</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox name="jedan" />}
                label="Jedan"
              />
              <FormControlLabel control={<Checkbox name="dva" />} label="Dva" />
              <FormControlLabel control={<Checkbox name="tri" />} label="3" />
            </FormGroup>
            <FormHelperText>Pomocni tekst</FormHelperText>
          </FormControl>
        )}
      </Box>
      <Drawer
        anchor="left"
        open={drawer}
        onClose={() => toggleDrawer(false)}
        hideBackdrop
      >
        <ClickAwayListener onClickAway={() => toggleDrawer(false)}>
          <div className={styles.drawerInner}>aaa</div>
        </ClickAwayListener>
      </Drawer>

      <Container maxWidth="lg">
        {allAds.map((item, index) => {
          return (
            <AdCard
              key={index}
              description={item.description}
              name={item.name}
              price={item.price}
              priceUnit={item.priceUnit}
              images={item.images}
              quantity={item.quantity}
              link={isLoggedIn() ? item.link : ""}
              subcategory={item.subcategory}
              disabled={!isLoggedIn()}
            ></AdCard>
          );
        })}
      </Container>
    </Container>
  );
};

export default Search;
