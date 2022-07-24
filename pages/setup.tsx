import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useId, useRef, useState } from "react";
import ImageCropper from "../components/ImgCropper";
import { useAuth } from "../contexts/AuthContext";
import styles from "../styles/setup.module.scss";
import { ImageFileUrl } from "../util/imageCropper";
import { MdOutlineCancel } from "react-icons/md";
import { HiOutlineUpload } from "react-icons/hi";
import { GrMapLocation } from "react-icons/gr";
import { toast } from "react-toastify";
import app, { auth, firestore, storage } from "../util/firebase";

const FirstLogin = () => {
  const { isLoggedIn, currUser } = useAuth();
  const router = useRouter();
  const dbInstance = firestore.getFirestore(app);
  const storageInstance = storage.getStorage(app);

  const id = useId();

  const [providerCheck, setProviderCheck] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition>(null);
  const [loading, setLoading] = useState(false);

  const name = useRef<HTMLInputElement>();
  const surname = useRef<HTMLInputElement>();
  const imageInput = useRef<HTMLInputElement>();
  const number = useRef<HTMLInputElement>();
  const category = useRef<HTMLSelectElement>();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/");
    else if (currUser?.displayName !== null) router.replace("/LogedIn");
  }, [isLoggedIn, router, currUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    firestore
      .addDoc(firestore.collection(dbInstance, "/users"), {
        name: name.current.value,
        surname: surname.current.value,
        number: number.current.value,
        isProvider: providerCheck,
        location: {
          lat: location?.coords.latitude ?? null,
          long: location?.coords.longitude ?? null,
        },
        category: category.current?.value ?? null,
      })
      .then(() => {
        if (croppedImage) {
          storage
            .uploadBytes(
              storage.ref(storageInstance, "image"),
              croppedImage.file
            )
            .then(() => {
              storage
                .getDownloadURL(storage.ref(storageInstance, "image"))
                .then((url) => {
                  auth
                    .updateProfile(currUser, {
                      displayName:
                        name.current.value + " " + surname.current.value,
                      photoURL: url,
                    })
                    .then(() => {
                      setLoading(false);
                      router.replace("/");
                    });
                });
            });
        } else {
          auth
            .updateProfile(currUser, {
              displayName: name.current.value + " " + surname.current.value,
              photoURL:
                "https://cdn.icon-icons.com/icons2/2406/PNG/512/user_account_icon_145918.png",
            })
            .then(() => {
              setLoading(false);
              router.replace("/");
            });
        }
      })
      .catch((e) => console.error("Error adding document: " + e));
  };

  const getCurrLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (res) => {
        setLocation(res);
        console.log(res.coords.latitude + " " + res.coords.longitude);
      },
      (err) => {
        if (err) {
          switch (err.code) {
            case err.PERMISSION_DENIED: {
              toast.error(
                "Kreiranje naloga za pruzaoca dobara/usluga nije moguce bez adrese!",
                { autoClose: false }
              );
            }
            case err.POSITION_UNAVAILABLE: {
              toast.error("Doslo je do greske prilikom lociranja", {
                autoClose: false,
              });
            }
          }
        }
      }
    );
  };

  const [file, setFile] = useState<File>(null);
  const [photoURL, setURL] = useState("");
  const [croppedImage, setCroppedImage] = useState<ImageFileUrl>(null);

  const fileChosen = (e) => {
    const input = e.target as HTMLInputElement;
    const file = input.files[0];
    if (file) {
      setFile(file);
      setURL(window.URL.createObjectURL(file));
      window.URL.revokeObjectURL(croppedImage?.url);
      input.value = "";
    }
  };

  return (
    <>
      <div className={styles.setupWrapper}>
        <div>Potrebno nam je jos par informacija pre nego sto pocnemo</div>
        <div className={styles.setup}>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor={`${id}-name`}>Ime</label>
              <input type="text" ref={name} required />
            </div>
            <div>
              <label htmlFor={`${id}-surname`}>Prezime</label>
              <input type="text" ref={surname} required />
            </div>
            <div>
              <label htmlFor={`${id}-number`}>Telefon</label>
              <input type="text" ref={number} required />
            </div>
            <div className={styles.imageUpload}>
              <input
                ref={imageInput}
                type="file"
                name="pic"
                id="pic11"
                onChange={fileChosen}
                hidden
              />
              {"Postavite sliku"}
              <HiOutlineUpload
                onClick={() => {
                  imageInput.current.click();
                }}
              />
            </div>
            <div className={styles.option}>
              {"Da li se registrujete kao pruzalac dobara/usluga?"}
              <div>
                <label htmlFor={`${id}-check`}>Da</label>
                <input
                  type="checkbox"
                  name="check"
                  id={`${id}-check`}
                  onChange={(e) => {
                    setProviderCheck(e.target.checked);
                  }}
                />
              </div>
            </div>
            {providerCheck && (
              <>
                <div className={styles.option}>
                  <label htmlFor={`${id}-category`}>Izaberite kategoriju</label>
                  <select
                    name="category"
                    id={`${id}-category`}
                    ref={category}
                    required
                  >
                    <option value="" hidden disabled selected></option>
                    <option value="products">Dobra</option>
                    <option value="services">Usluge</option>
                  </select>
                </div>
                <div className={styles.option}>
                  {"Kliknite za automatsko odredjivanje adrese"}
                  <GrMapLocation onClick={getCurrLocation} />
                </div>
              </>
            )}
            <button
              disabled={loading}
              className={loading ? styles.loading : ""}
            >
              Potvrdi
            </button>
          </form>
          {croppedImage && (
            <div className={styles.imagePreview}>
              <Image src={croppedImage?.url} layout="fill" objectFit="cover" />
              <div>
                <MdOutlineCancel
                  onClick={() => {
                    setCroppedImage(null);
                    window.URL.revokeObjectURL(croppedImage.url); //obavezno da se ne zatrpava browser
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {file && (
          <ImageCropper
            aspect={1 / 1}
            image={photoURL}
            setCroppedImage={setCroppedImage}
            setFile={setFile}
            setURL={setURL}
          />
        )}
      </div>
    </>
  );
};

export default FirstLogin;