import React from "react";
import AdCard from "../components/AdCard";
import { adSchema } from "../models/Advertisement";
import { getUserAds } from "../util/firebase";

export const getServerSideProps = async ({ query }) => {
  const userAds = await getUserAds(query.id).then((res) => {
    return res.docs.map((ad, index) => {
      const temp = adSchema.cast(ad.data(), { stripUnknown: true });
      return {
        ...temp,
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
        return <AdCard ad={val} key={index}></AdCard>;
      })}
    </div>
  );
};

export default User;
