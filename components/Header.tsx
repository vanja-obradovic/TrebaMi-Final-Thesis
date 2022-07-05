import React from "react";

const Header = () => {
  return (
    <header>
      <span>DIPLOMSKI</span>

      <a href="#popupTarget">Prijavi se</a>
      <div id="popupTarget" className="overlay">
        <div className="popup">
          <div>hello pipl</div>
          <a href="#">X</a>
        </div>
      </div>
    </header>
  );
};
export default Header;
