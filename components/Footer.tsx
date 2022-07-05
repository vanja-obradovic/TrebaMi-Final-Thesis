import React from "react";
import Image from "../node_modules/next/image";
import Link from "../node_modules/next/link";
import { IconContext } from "../node_modules/react-icons/lib/esm/iconContext";
import {
  TbBrandNextjs,
  TbBrandFirebase,
} from "../node_modules/react-icons/tb/index";

const Footer = () => {
  return (
    <footer>
      <div>
        Diplomski
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
        <div style={{ flex: "1" }}>
          <Image
            src={
              "https://scontent.fbeg4-1.fna.fbcdn.net/v/t31.18172-8/14138594_1750421105232006_514403147358347585_o.jpg?_nc_cat=102&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=4I1QvQtrjFYAX874vBz&tn=amlEqKe__0WpSPS1&_nc_ht=scontent.fbeg4-1.fna&oh=00_AT8Ufssib5CpmhqMiAVu0PHADON7Q8xSywXP7j5DYiPhow&oe=62E8B3AD"
            }
            width="200px"
            height="200px"
            layout="responsive"
          />
        </div>
        <div style={{ flex: "1" }}>
          Autor
          <br />
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