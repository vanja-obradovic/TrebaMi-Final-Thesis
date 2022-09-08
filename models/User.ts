import * as yup from "yup";
import { locationSchema } from "./Location";
export const userSchema = yup.object({
  ad: yup.object({
    count: yup.number(),
    permitted: yup.number(),
  }),
  adPromotion: yup.object({
    count: yup.number(),
    permitted: yup.number(),
  }),
  category: yup.string().nullable(),
  isProvider: yup.boolean(),
  location: yup.object().shape(locationSchema.fields).nullable(),
  membership: yup.string(),
  name: yup.string(),
  rating: yup.number().nullable(),
  reputation: yup.number().nullable(),
  surname: yup.string(),
  commentsNumber: yup.number(),
  photoURL: yup.string().url().nullable(),
});

export type User = yup.InferType<typeof userSchema>;
