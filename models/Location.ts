import { GeoPoint } from "firebase/firestore";
import * as yup from "yup";

export const locationSchema = yup.object({
  coords: yup.object({
    lat: yup.number().required(),
    lng: yup.number().required(),
  }),
  countrySecondarySubdivision: yup.string(),
  municipality: yup.string(),
});

export const coordsSchema = yup.object({
  lat: yup.number().required(),
  lng: yup.number().required(),
});

export type Location = yup.InferType<typeof locationSchema>;
export type Coords = yup.InferType<typeof coordsSchema>;
