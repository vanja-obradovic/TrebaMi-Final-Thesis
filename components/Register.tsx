import { TextField } from "@mui/material";
import Router from "next/router";
import React, { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Toast from "react-toastify/dist/types";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/popup.module.scss";

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const Register = ({ setPopup, setRegister }) => {
  const id = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();

  const email = useRef<HTMLInputElement>();
  const password = useRef<HTMLInputElement>();
  const confirmPassword = useRef<HTMLInputElement>();

  const passRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d*.!@#$%^&(){}\[\]:\";'<>,.?\/~`_+-=|]{8,}$/;
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const toastId = useRef<Toast.Id>(null);
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  // const [errors, setErrors] = useState<boolean[]>([false, false, false]);

  const handleSignup = async (data: FormData) => {
    setLoading(true);
    await signup?.(data.email, data.password)
      .then((res) => {
        if (res.user.displayName === null) Router.push("/setup");
      })
      .catch(() => {
        toast.error("Greska u registraciji!");
      });
    setLoading(false);
  };

  const handleErrors = (err) => {
    if (err.email) toast.error(err.email.message, { autoClose: 2500 });
    if (err.password) toast.error(err.password.message, { autoClose: 2500 });
    if (err.confirmPassword)
      toast.error(err.confirmPassword.message, { autoClose: 2500 });
  };

  return (
    <div className={styles.signup}>
      <form onSubmit={handleSubmit(handleSignup, handleErrors)} noValidate>
        <h2>Registruj se</h2>

        <TextField
          type="email"
          id={`${id}-email`}
          {...register("email", {
            pattern: {
              value: emailRegex,
              message: "Uneta email adresa nije ispravna",
            },
            required: "Morate uneti email adresu",
          })}
          label="Email"
          error={errors[0]}
          required
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
          {...register("password", {
            pattern: {
              value: passRegex,
              message: "Uneta lozinka nije u traznom formatu",
            },
            required: "Morate uneti lozinku",
          })}
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
          {...register("confirmPassword", {
            validate: {
              check: (value) =>
                value === getValues("password") || "Lozinke se ne poklapaju",
            },
            required: "Morate uneti potvrdu lozinke",
          })}
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
