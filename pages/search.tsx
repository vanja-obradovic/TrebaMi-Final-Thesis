import { QuerySnapshot } from "firebase/firestore";
import React from "react";
import { adSchema } from "../models/Advertisement";
import { getAdsAdvanced, getAdsByKeyword } from "../util/firebase";

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

const Search = ({ allAds }) => {
  const names = allAds.map((val) => val.name);
  return names.map((val, index) => {
    return <div key={index}>{val}</div>;
  });
};

export default Search;
