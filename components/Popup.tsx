import { Box, ClickAwayListener, Container } from "@mui/material";
import React from "react";
import { useState } from "react";
import styles from "../styles/popup.module.scss";
import Login from "./Login";
import Register from "./Register";

const Popup = () => {
  const [popUp, setPopup] = useState(false);
  const [register, setRegister] = useState(false);

  return (
    <>
      <a onClick={() => setPopup(true)} id="loginPopup">
        Prijavi se
      </a>
      {popUp && (
        <Container
          maxWidth={false}
          id="popupTarget"
          className={styles.overlay}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setPopup(false);
              setRegister(false);
            }
          }}
        >
          <ClickAwayListener
            onClickAway={() => {
              setPopup(false);
              setRegister(false);
            }}
          >
            <Container maxWidth="sm" className={styles.popupWrapper}>
              {/* <div className={styles.popupWrapper}> */}
              {!register && (
                <Login setPopup={setPopup} setRegister={setRegister} />
              )}
              {register && (
                <Register setPopup={setPopup} setRegister={setRegister} />
              )}
              {/* </div> */}
            </Container>
          </ClickAwayListener>
        </Container>
      )}
    </>
  );
};

export default Popup;
