import Image from "next/image";
import React, { useState } from "react";
import { HiOutlineUserCircle } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/userdd.module.scss";

const UserDropDown = () => {
  const [dropDown, setDropDown] = useState(false);
  const { signout, currUser } = useAuth();

  return (
    <div className={styles.dropDownWrapper}>
      {currUser?.photoURL ? (
        <Image src={currUser.photoURL} width="50px" height={"50px"}></Image>
      ) : (
        <HiOutlineUserCircle
          className={styles.basicIcon}
          onClick={() => {
            setDropDown(!dropDown);
          }}
        />
      )}

      {dropDown && (
        <div className={styles.dropDown}>
          <span
            onClick={() => {
              signout();
            }}
          >
            Logout
          </span>
        </div>
      )}
    </div>
  );
};

export default UserDropDown;
