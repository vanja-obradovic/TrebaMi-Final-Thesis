import Router from "next/router";
import React, { useRef, useId } from "react";
import { useAuth } from "../contexts/AuthContext";
import Popup from "./Popup";
import UserDropDown from "./UserDropDown";

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <header>
      <span
        onClick={() => {
          Router.push("/");
        }}
      >
        DIPLOMSKI
      </span>

      {!isLoggedIn() && <Popup />}

      {isLoggedIn() && <UserDropDown />}
    </header>
  );
};
export default Header;
