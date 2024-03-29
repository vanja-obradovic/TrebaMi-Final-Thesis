import * as yup from "yup";
import { locationSchema } from "./Location";

export const adSchemaCard = yup.object({
  name: yup.string(),
  price: yup.number(),
  priceUnit: yup.string(),
  subcategory: yup.string(),
  quantity: yup.number().notRequired().nullable(),
  images: yup.array(yup.string().url()).notRequired(),
  rating: yup.number().min(1).max(5).notRequired().nullable(),
  provider: yup.object({
    displayName: yup.string().required(),
    location: yup.object().shape(locationSchema.fields),
    photoURL: yup.string().url().nullable(),
  }),
  link: yup.string().optional().nullable(),
});

export const adSchema = yup.object({
  name: yup.string(),
  price: yup.number(),
  priceUnit: yup.string(),
  description: yup.string(),
  subcategory: yup.string(),
  category: yup.string(),
  quantity: yup.number().notRequired().nullable(),
  images: yup.array(yup.string().url()).notRequired(),
  rating: yup.number().min(1).max(5).notRequired().nullable(),
  ratings: yup.number().notRequired().nullable(),
  provider: yup.object({
    displayName: yup.string().required(),
    location: yup.object().shape(locationSchema.fields),
    photoURL: yup.string().url().nullable(),
  }),
  pendingUsers: yup.array(yup.string()),
  link: yup.string().optional().nullable(),
});

export type Advertisement = yup.InferType<typeof adSchema>;
export type AdvertisementCard = yup.InferType<typeof adSchemaCard>;
export type ProductSubCat = "Hrana" | "Hemija" | "Drvo" | "Koza" | "Tekstil";
export type ServiceSubCat =
  | "Gradjevina"
  | "Transport"
  | "Vodovod"
  | "Elektrika";

export const productSubCategories = [
  "Hrana",
  "Tekstil",
  "Koza",
  "Drvo",
  "Hemija",
];
export const serviceSubCategories = [
  "Transport",
  "Gradjevina",
  "Elektrika",
  "Vodovod",
];
