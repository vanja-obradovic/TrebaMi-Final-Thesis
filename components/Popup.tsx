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
      <a onClick={() => setPopup(true)}>Prijavi se</a>
      {popUp && (
        <div id="popupTarget" className={styles.overlay}>
          <div className={styles.popupWrapper}>
            <Login setPopup={setPopup} setRegister={setRegister} />
            {register && (
              <Register setPopup={setPopup} setRegister={setRegister} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
