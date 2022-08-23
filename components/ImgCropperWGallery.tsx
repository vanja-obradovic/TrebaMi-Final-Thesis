import { Box, Button, Tooltip } from "@mui/material";
import React, { Dispatch, SetStateAction, useCallback, useState } from "react";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import Cropper, { Area, Point } from "react-easy-crop";
import styles from "../styles/galleryCropper.module.scss";
import getCroppedImg, { ImageFileUrl } from "../util/imageCropper";
import { useEffect } from "react";
import { toast } from "react-toastify";

interface CropperProps {
  aspect: number;
  images?: string[];
  setCroppedImage: Dispatch<SetStateAction<ImageFileUrl[]>>;
  setPhotoURLs: Dispatch<SetStateAction<string[]>>;
  inputRef: React.MutableRefObject<HTMLInputElement>;
}

const GalleryCropper = (props: CropperProps) => {
  const { aspect, setCroppedImage, setPhotoURLs, inputRef, images } = props;

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const [imagesToCrop, setImagestoCrop] = useState<string[]>([]);

  useEffect(() => {
    setImagestoCrop(images);
  }, [images]);

  const showCroppedImage = useCallback(async () => {
    if (imagesToCrop.length === 0)
      toast.error("Nema slike koja moze da se kropuje");
    if (imagesToCrop.length === 1) {
      setPhotoURLs([]);
    }
    try {
      const croppedImage = await getCroppedImg(
        imagesToCrop[0],
        croppedAreaPixels
      );
      window.URL.revokeObjectURL(imagesToCrop[0]);
      setImagestoCrop((prev) => [...prev.slice(1)]);
      console.log("donee", { croppedImage });
      setCroppedImage((prev) => [...prev, croppedImage]);
      console.log(imagesToCrop);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, setCroppedImage, setPhotoURLs, imagesToCrop]);
  return (
    <>
      <div className={styles.cropperPopUp}>
        <div className={styles.cropperWrapper}>
          {!!imagesToCrop.length ? (
            <Cropper
              image={imagesToCrop[0]}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              zoomSpeed={0.25}
              classes={{
                containerClassName: styles.cropper,
                cropAreaClassName: styles.area,
              }}
            />
          ) : (
            <Box className={styles.cropperWrapper}>
              <Tooltip title="Dodaj sliku" arrow>
                <div
                  className={styles.cropperNoImg}
                  onClick={() => {
                    inputRef.current.click();
                  }}
                >
                  <AddOutlinedIcon
                    style={{ color: "white", width: "100%", height: "100%" }}
                  />
                </div>
              </Tooltip>
            </Box>
          )}
        </div>

        {!!imagesToCrop.length && (
          <>
            <div>
              <p>
                Koristite tockic misa ili touchpad za zumiranje. Prikaz se moze
                pomerati da bi se postigao zeljeni izgled.
              </p>
            </div>

            <div className={styles.actions}>
              <Tooltip title="Odbaci" arrow>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    window.URL.revokeObjectURL(imagesToCrop[0]);
                    setImagestoCrop((prev) => [...prev.slice(1)]);
                    if (imagesToCrop.length === 0) setPhotoURLs([]);
                  }}
                  variant="contained"
                  color="error"
                >
                  <ClearOutlinedIcon />
                </Button>
              </Tooltip>
              <Tooltip title="Prihvati" arrow>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    showCroppedImage();
                  }}
                  variant="contained"
                  color="success"
                >
                  <CheckOutlinedIcon />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default GalleryCropper;
