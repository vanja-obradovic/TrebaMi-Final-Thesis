import { TextField } from "@mui/material";
import Router from "next/router";
import React, { useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import Toast from "react-toastify/dist/types";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/popup.module.scss";

const Register = ({ setPopup, setRegister }) => {
  const id = useId();

  const email = useRef<HTMLInputElement>();
  const password = useRef<HTMLInputElement>();
  const confirmPassword = useRef<HTMLInputElement>();

  const passRegex = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d*.!@#$%^&(){}\[\]:\";'<>,.?\/~`_+-=|]{8,}$/
  );
  const emailRegex = new RegExp(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );

  const toastId = useRef<Toast.Id>(null);
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<boolean[]>([false, false, false]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors(() => {
      errors[0] = errors[1] = errors[2] = false;
      return [...errors];
    });
    console.log(errors);
    setLoading(true);

    if (!emailRegex.test(email.current.value ?? "")) {
      console.log(emailRegex.test(email.current.value));
      toast.error("Uneta email adresa nije ispravna");
      setErrors([true, errors[1], errors[2]]);
      setLoading(false);
      return;
    } else if (!passRegex.test(password.current.value ?? "")) {
      toastId.current =
        toastId.current ??
        toast.error(
          "Lozinka mora imati makar jedno veliko i malo slovo, jedan broj i specijalni karakter i imati minimalno 8 karaktera!"
        );
      setErrors([errors[0], true, errors[2]]);
      setLoading(false);
      return;
    } else if (confirmPassword.current.value !== password.current.value) {
      toast.error("Lozinke nisu iste!");
      setErrors([errors[0], true, true]);
      setLoading(false);
      return;
    }

    await signup?.(email.current.value, password.current.value)
      .then((res) => {
        if (res.user.displayName === null) Router.push("/setup");
      })
      .catch((err) => {
        toast.error("Greska u registraciji!");
      });
    setLoading(false);
  };

  return (
    <div className={styles.signup}>
      <form onSubmit={handleSignup} noValidate>
        <h2>Registruj se</h2>

        <TextField
          type="email"
          id={`${id}-email`}
          inputRef={email}
          required
          label="Email"
          error={errors[0]}
          helperText={errors[0] ? "Ovo polje je obavezno" : ""}
          size="small"
          InputProps={{ className: styles.inputStyle }}
          InputLabelProps={{ className: styles.inputStyle }}
          autoFocus
        />

        <TextField
          type="password"
          name="pass"
          id={`${id}-password`}
          inputRef={password}
          required
          label="Password"
          error={errors[1]}
          helperText={errors[1] ? "Ovo polje je obavezno" : ""}
          size="small"
          InputProps={{ className: styles.inputStyle }}
          InputLabelProps={{ className: styles.inputStyle }}
        />

        <TextField
          type="password"
          name="confirmPass"
          id={`${id}-confirmPassword`}
          inputRef={confirmPassword}
          required
          label="Confirm Password"
          error={errors[2]}
          helperText={errors[2] ? "Ovo polje je obavezno" : ""}
          size="small"
          InputProps={{ className: styles.inputStyle }}
          InputLabelProps={{ className: styles.inputStyle }}
        />

        <button
          disabled={loading}
          className={loading ? styles.loading : ""}
          onClick={() => (toastId.current = null)}
        >
          <span className={styles.btnText}>Potvrdi</span>
        </button>
        <div>
          Vec imate nalog?
          <br />
          <a onClick={() => setRegister(false)}>Prijavite se</a>
          {"."}
        </div>
      </form>
      <div>OR sign in with google</div>
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

export default Register;
