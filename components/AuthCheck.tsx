import { Box, Container } from "@mui/system";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Toast from "react-toastify/dist/types";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/authFallback.module.scss";

export default function AuthCheck(props) {
  const { currUser } = useAuth();

  const toastId = useRef<Toast.Id>(null);

  useEffect(() => {
    if (currUser !== undefined) {
      if (currUser === null) {
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
    }
  }, [currUser]);

  return currUser !== null
    ? props.children
    : props.fallback || (
        <div className={styles.messageWrapper}>
          <div className={styles.message}>
            <div>
              Don&apos;t want to sign in?
              <br />
              Fine, here&apos;s a random picture so you don&apos;t get bored.
            </div>
            <div className={styles.image}>
              <img src="https://picsum.photos/500/300" />
            </div>
          </div>
        </div>
      );
}
