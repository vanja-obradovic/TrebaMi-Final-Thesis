import React, { useCallback, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import styles from "../styles/cropper.module.scss";
import { TiTickOutline } from "react-icons/ti";
import { MdOutlineCancel } from "react-icons/md";
import getCroppedImg from "../util/imageCropper";

const ImageCropper = ({ aspect, image, setCroppedImage, setFile, setURL }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      setURL("");
      window.URL.revokeObjectURL(image);
      console.log("donee", { croppedImage });
      setCroppedImage(croppedImage);
      setFile(null);
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, image, setCroppedImage, setFile]);

  return (
    <div className={styles.cropperPopUp}>
      <div className={styles.cropperWrapper}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          classes={{
            containerClassName: `${styles.cropper}`,
            cropAreaClassName: `${styles.area}`,
          }}
        />
      </div>
      <div>
        <p>
          Use mouse scroll or touchpad to zoom. Box can be moved to achive
          desired crop.
        </p>
      </div>
      <div>
        <button
          onClick={(e) => {
            e.preventDefault();
            showCroppedImage();
          }}
        >
          <TiTickOutline />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setFile(null);
          }}
        >
          <MdOutlineCancel />
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
