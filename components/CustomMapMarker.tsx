import { ClickAwayListener } from "@mui/material";
import React, { useState } from "react";
import { ProductSubCat } from "../models/Advertisement";
import styles from "../styles/CustomMapMarker.module.scss";

interface markerProps {
  type: ProductSubCat;
}

const CustomMapMarker = (props: markerProps) => {
  const { type } = props;

  const [toggle, setToggle] = useState(false);
  return (
    <ClickAwayListener onClickAway={() => setToggle(false)}>
      <div
        className={styles.marker}
        onClick={() => {
          setToggle(true);
        }}
      >
        <div
          className={[styles.markerContent, toggle ? styles.gold : ""].join(
            " "
          )}
        >
          <div className={styles[type]}></div>
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default CustomMapMarker;
