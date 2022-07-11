import { useRouter } from "next/router";
import React, { useCallback, useEffect, useId, useState } from "react";
import ImageCropper from "../components/ImgCropper";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/setup.module.scss";
import { ImageFileUrl } from "../util/imageCropper";

const FirstLogin = () => {
  const handleSubmit = (e) => {
    // e.preventDefault();
  };

  const { isLoggedIn, currUser } = useAuth();
  const router = useRouter();

  const id = useId();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/");
    else if (currUser?.displayName !== null) router.replace("/LogedIn");
  }, [isLoggedIn, router, currUser]);

  const [file, setFile] = useState<File>(null);
  const [photoURL, setURL] = useState("");
  const [croppedImage, setCroppedImage] = useState<ImageFileUrl>(null);

  const fileChosen = (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files[0];
    if (file) {
      setFile(file);
      setURL(window.URL.createObjectURL(file));
      input.value = "";
    }
  };

  return (
    <>
      <div className={styles.setup}>
        <form onClick={handleSubmit}>
          <span>
            <label htmlFor={`${id}-name`}>Ime</label>
            <input type="text" />
          </span>
          <span>
            <label htmlFor={`${id}-surname`}>Prezime</label>
            <input type="text" />
          </span>
          {"adresa ..."}
          <span>
            <label htmlFor={`${id}-name`}>Telefon</label>
            <input type="number" />
          </span>
          {"slika..."}
          <input type="file" name="pic" id="pic11" onChange={fileChosen} />
          {file && (
            <ImageCropper
              aspect={1 / 1}
              image={photoURL}
              setCroppedImage={setCroppedImage}
              setFile={setFile}
            />
          )}
          <img src={croppedImage?.url} alt="" />
          {croppedImage && (
            <span
              onClick={() => {
                setCroppedImage(null);
                window.URL.revokeObjectURL(croppedImage.url); //obavezno da se ne zatrpava browser
              }}
            >
              &times;
            </span>
          )}
          <div className={styles.option}>
            Da li zelite da se registrujete kao pruzalac dobara/usluga
            <div>
              <label htmlFor={`${id}-option-1`}>Da</label>
              <input type="radio" name="provider" id={`${id}-option-1`} />
            </div>
            <div>
              <label htmlFor={`${id}-option-2`}>Ne</label>
              <input type="radio" name="provider2" id={`${id}-option-2`} />
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-category`}>Izaberite kategoriju</label>
            <select
              name="category"
              id={`${id}-category`}
              defaultValue={"default"}
            >
              <option value="default" hidden disabled></option>
              <option value="products">Dobra</option>
              <option value="services">Usluge</option>
            </select>
          </div>
        </form>
      </div>
    </>
  );
};

export default FirstLogin;
