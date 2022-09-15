import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  TbBrandNextjs,
  TbBrandFirebase,
} from "../node_modules/react-icons/tb/index";

const Footer = () => {
  return (
    <footer>
      <div>
        <h2 style={{ margin: "0" }}>TrebaMi</h2>

        <h4>-Diplomski rad-</h4>
        <div>
          <p>
            Napravljeno pomocu
            <br />
            <Link href={"https://nextjs.org"}>
              <a>
                <TbBrandNextjs />
              </a>
            </Link>
            <Link href={"https://firebase.google.com/"}>
              <a>
                <TbBrandFirebase />
              </a>
            </Link>
          </p>
        </div>
      </div>
      <div className="author">
        <div></div>
        <div>
          <h2 style={{ margin: "0" }}>Autor</h2>
          <p>
            Vanja Obradovic <br />
            2018/0393
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
