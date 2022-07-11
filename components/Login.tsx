import Image from "next/image";
import Router from "next/router";
import React, { useId, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/popup.module.scss";

const Login = ({ setPopup, setRegister }) => {
  const id = useId();

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
      <form onSubmit={handleLogin}>
        <h2>Prijavi se</h2>
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
            name="pass"
            id={`${id}-password`}
            ref={password}
            required
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity("Ovo polje je obavezno!")
            }
            onInput={(e) => e.currentTarget.setCustomValidity("")}
          />
        </div>

        <button disabled={loading} className={loading ? styles.loading : ""}>
          <span className={styles.btnText}>Potvrdi</span>
        </button>
        <div>
          Nemate nalog?
          <br /> Regstrujte se <a onClick={() => setRegister(true)}>ovde</a>
          {"."}
        </div>
      </form>
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
