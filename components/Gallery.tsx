import { Box, Button, Container } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import styles from "../styles/gallery.module.scss";

interface GalleryProps {
  images: string[];
}

const Gallery = (props: GalleryProps) => {
  const { images } = props;

  const [primaryIndex, setPrimaryIndex] = useState(0);

  const nextImage = (len: number) => {
    if (primaryIndex === len - 1) setPrimaryIndex(0);
    else setPrimaryIndex((prev) => prev + 1);
  };

  const prevImage = (len: number) => {
    if (primaryIndex === 0) setPrimaryIndex(len - 1);
    else setPrimaryIndex((prev) => prev - 1);
  };
  return (
    <>
      <Container
        maxWidth="md"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.code === "ArrowLeft") prevImage(images.length);
          if (e.code === "ArrowRight") nextImage(images.length);
        }}
        sx={{ outline: "none!important" }}
      >
        <Box className={styles.primaryPhoto}>
          {images.length > 1 && (
            <ChevronLeftIcon
              className={styles.arrow}
              color="primary"
              onClick={() => {
                prevImage(images.length);
              }}
            />
          )}
          <Image
            src={images.length ? images[primaryIndex] : "/noImg.png"}
            layout="fill"
          ></Image>
          {images.length > 1 && (
            <ChevronRightIcon
              className={styles.arrow}
              color="primary"
              onClick={() => {
                nextImage(images.length);
              }}
            />
          )}
        </Box>
      </Container>
      <Box className={styles.preview}>
        {images.map((src, index) => {
          return (
            <Button
              className={styles.photoPreview}
              key={index}
              onClick={() => {
                setPrimaryIndex(index);
              }}
              style={
                index === primaryIndex
                  ? { outline: "solid #081e85" }
                  : { outline: "none" }
              }
            >
              <Image src={src} layout="fill"></Image>
            </Button>
          );
        })}
      </Box>
    </>
  );
};

export default Gallery;
