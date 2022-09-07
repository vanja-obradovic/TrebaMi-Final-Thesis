import Image from "next/image";
import Router from "next/router";
import React, { useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/popup.module.scss";
import { TextField } from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { format, isBefore } from "date-fns";

type FormData = {
  email: string;
  password: string;
};

const Login = ({ setPopup, setRegister }) => {
  const id = useId();

  const { register, handleSubmit } = useForm<FormData>();

  const [loading, setLoading] = useState(false);

  const { login, signout } = useAuth();

  const handleLogin = async (data: FormData) => {
    setLoading(true);
    login?.(data.email, data.password)
      .then((result) => {
        result.user.getIdTokenResult().then((res) => {
          const time = new Date().getTime();
          if (
            isBefore(time, +res.claims["disabledUntil"]?.toString() ?? time)
          ) {
            signout();
            toast.error(
              "Vas nalog je privremeno suspendovan do " +
                format(
                  +res.claims["disabledUntil"]?.toString(),
                  "dd.MM.yy/HH:mm"
                ),
              { position: "top-center", autoClose: false }
            );
          } else {
            if (result.user.displayName === null) Router.push("/setup");
          }
        });
      })
      .catch((err) => {
        console.log(err.message);
        toast.error("Pogresan email ili sifra!");
      });
    setLoading(false);
  };

  const handleErrors = (err) => {
    if (err.email) toast.error(err.email.message);
    if (err.password) toast.error(err.password.message);
  };

  return (
    <div className={styles.login}>
      <div>
        <Image
          src={"/loginPic.webp"}
          width="300px"
          height="200px"
          layout="fill"
          objectFit="cover"
        ></Image>
      </div>
      <Box
        component="form"
        onSubmit={handleSubmit(handleLogin, handleErrors)}
        noValidate
      >
        <h2>Prijavi se</h2>,
        <TextField
          type="email"
          id={`${id}-email`}
          {...register("email", {
            required: "Morate uneti ispravnu email adresu",
          })}
          label="Email"
          required
          variant="outlined"
          size="small"
          InputProps={{ className: styles.inputStyle }}
          InputLabelProps={{ className: styles.inputStyle }}
          autoFocus
        />
        <TextField
          type="password"
          name="pass"
          id={`${id}-password`}
          {...register("password", { required: "Morate uneti sifru" })}
          label="Password"
          required
          variant="outlined"
          size="small"
          InputProps={{ className: styles.inputStyle }}
          InputLabelProps={{ className: styles.inputStyle }}
        />
        <button
          disabled={loading}
          className={loading ? styles.loading : ""}
          type="submit"
        >
          <span className={styles.btnText}>Potvrdi</span>
        </button>
        <div>
          Nemate nalog?
          <br /> Regstrujte se <a onClick={() => setRegister(true)}>ovde</a>
          {"."}
        </div>
      </Box>
      <a
        onClick={() => {
          setPopup(false);
          setRegister(false);
        }}
      >
        &times;
      </a>
    </div>
  );
};

export default Login;
