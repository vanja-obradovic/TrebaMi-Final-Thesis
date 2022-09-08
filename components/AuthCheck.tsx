import { CircularProgress, Paper } from "@mui/material";
import Image from "next/image";
import Router from "next/router";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Toast from "react-toastify/dist/types";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/authFallback.module.scss";

interface AuthCheckProps {
  children;
  fallback?: React.ReactNode;
  checkWith?: string[];
}

export default function AuthCheck({
  children,
  checkWith,
  fallback,
}: AuthCheckProps) {
  const { currUser } = useAuth();

  const toastId = useRef<Toast.Id>(null);

  useEffect(() => {
    if (currUser !== undefined) {
      if (currUser === null) {
        setTimeout(() => {
          if (Router.pathname !== "/") {
            toastId.current =
              toastId.current ??
              toast.error("You must be signed in to continue", {
                closeButton: false,
                closeOnClick: false,
                position: "top-center",
                style: { marginTop: "2.5vmin" },
                draggable: false,
              });
            document.getElementById("loginPopup").click();
          }
        }, 500);
      }
    }
  }, [currUser]);

  return currUser === undefined ? (
    <></>
  ) : currUser !== null ? (
    (!!checkWith?.length ? checkWith.includes(currUser.uid) : true) ? (
      children
    ) : (
      <div className={styles.messageWrapper}>
        <Paper className={styles.message} elevation={4}>
          <div>
            Pokusali ste da pristupite necemu sto nije Vase,
            <br />
            ali neko je to ocekivao pa niste uspeli.
            <br /> Vise srece drugi put 🍀
          </div>
        </Paper>
      </div>
    )
  ) : (
    fallback || (
      <div className={styles.messageWrapper}>
        <Paper className={styles.message} elevation={4}>
          <div>
            Ne zelite da se ulogujete?
            <br />
            Dobro, evo jedne slike da Vam ne bude dosadno 😊
          </div>
          <div className={styles.image}>
            <Image
              src="https://picsum.photos/500/300"
              layout="fill"
              alt="randomImg"
            />
          </div>
        </Paper>
      </div>
    )
  );
}
