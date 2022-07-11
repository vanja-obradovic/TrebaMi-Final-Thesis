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

  const passRegex = RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d*.!@#$%^&(){}\\[\\]:\";'<>,.?\\/~`_+-=|]{8,}$"
  );
  const toastId = useRef<Toast.Id>(null);
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (confirmPassword.current.value !== password.current.value) {
        toast.error("Lozinke nisu iste!");
        setLoading(false);
        return;
      } else if (!passRegex.test(password.current.value)) {
        toastId.current =
          toastId.current ??
          toast.warn(
            "Lozinka mora imati makar jedno veliko i malo slovo, jedan broj i specijalni karakter i imati minimalno 8 karaktera!"
          );
        setLoading(false);
        return;
      }
      await signup?.(email.current.value, password.current.value).then(
        (res) => {
          if (res.additionalUserInfo.isNewUser) Router.push("/setup");
        }
      );
    } catch {
      toast.error("Greska u registraciji!");
    }
    setLoading(false);
  };

  return (
    <div className={styles.signup}>
      <form onSubmit={handleSignup}>
        <h2>Registruj se</h2>
        <div>
          <label htmlFor={`${id}-email`}>Email</label>
          <input
            type="email"
            id={`${id}-email`}
            ref={email}
            required
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity("Pogresan format email adrese!")
            }
            onInput={(e) => e.currentTarget.setCustomValidity("")}
          />
        </div>
        <div>
          <label htmlFor={`${id}-password`}>Password</label>
          <input
            type="password"
            name="passR"
            id={`${id}-password`}
            ref={password}
            required
            onInvalid={(e) => {
              e.currentTarget.setCustomValidity(
                "Lozinka nije u adekvatnom formatu!"
              );
              toastId.current =
                toastId.current ??
                toast.warn(
                  "Lozinka mora imati makar jedno veliko i malo slovo, jedan broj i specijalni karakter i imati minimalno 8 karaktera!"
                );
            }}
            onInput={(e) => e.currentTarget.setCustomValidity("")}
          />
        </div>
        <div>
          <label htmlFor={`${id}-confirmPassword`}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassR"
            id={`${id}-confirmPassword`}
            ref={confirmPassword}
            required
            onInvalid={(e) => {
              e.currentTarget.setCustomValidity(
                "Lozinka nije u adekvatnom formatu!"
              );
            }}
            onInput={(e) => e.currentTarget.setCustomValidity("")}
          />
        </div>

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
