import React, { useRef, useId } from "react";
import { useAuth } from "../contexts/AuthContext";
import Popup from "./Popup";
import UserDropDown from "./UserDropDown";

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <header>
      <span>DIPLOMSKI</span>

      {!isLoggedIn() && <Popup />}

      {isLoggedIn() && <UserDropDown />}
    </header>
  );
};
export default Header;
