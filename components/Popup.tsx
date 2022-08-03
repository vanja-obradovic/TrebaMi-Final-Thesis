import { Container } from "@mui/material";
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
        <div id="popupTarget" className={styles.overlay}>
          <Container maxWidth="md" className={styles.popupWrapper}>
            {/* <div className={styles.popupWrapper}> */}
            {!register && (
              <Login setPopup={setPopup} setRegister={setRegister} />
            )}
            {register && (
              <Register setPopup={setPopup} setRegister={setRegister} />
            )}
            {/* </div> */}
          </Container>
        </div>
      )}
    </>
  );
};

export default Popup;
