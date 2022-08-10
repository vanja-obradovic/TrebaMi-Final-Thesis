import Image from "next/image";
import Router from "next/router";
import React, { useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/popup.module.scss";
import { TextField } from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";

const Login = ({ setPopup, setRegister }) => {
  const id = useId();

  const { register, handleSubmit, formState } = useForm();
  const { isValid } = formState;
  const onSubmit = (data) => console.log(data);

  const email = useRef<HTMLInputElement>();
  const password = useRef<HTMLInputElement>();
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login?.(email.current.value, password.current.value).then((res) => {
        if (res.user.displayName === null) Router.push("/setup");
      });
    } catch {
      toast.error("Pogresno korisnicko ime ili sifra!");
    }
    setLoading(false);
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
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <h2>Prijavi se</h2>,
        <TextField
          type="email"
          id={`${id}-email`}
          {...register("email")}
          required
          label="Email"
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
          {...register("password")}
          required
          label="Password"
          variant="outlined"
          size="small"
          InputProps={{ className: styles.inputStyle }}
          InputLabelProps={{ className: styles.inputStyle }}
        />
        <button
          disabled={loading || !isValid}
          className={loading ? styles.loading : ""}
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
