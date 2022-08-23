import React from "react";
import AdCard from "../components/AdCard";
import { adSchema } from "../models/Advertisement";
import { getUserAds } from "../util/firebase";

export const getServerSideProps = async ({ query }) => {
  const userAds = await getUserAds(query.id).then((res) => {
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
  });
  return { props: { userAds: userAds } };
};

const User = ({ userAds }) => {
  return (
    <div>
      User
      {userAds.map((val, index) => {
        return <AdCard {...val} key={index}></AdCard>;
      })}
    </div>
  );
};

export default User;
