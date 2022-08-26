import * as yup from "yup";

export const adSchemaCard = yup.object({
  name: yup.string(),
  price: yup.string(),
  priceUnit: yup.string(),
  description: yup.string(),
  subcategory: yup.string(),
  category: yup.string(),
  quantity: yup.number().notRequired().nullable(),
  images: yup.array(yup.string().url()).notRequired(),
});

export const adSchema = yup.object({
  name: yup.string(),
  price: yup.string(),
  priceUnit: yup.string(),
  description: yup.string(),
  subcategory: yup.string(),
  category: yup.string(),
  quantity: yup.number().notRequired().nullable(),
  images: yup.array(yup.string().url()).notRequired(),
  provider: yup.object({
    displayName: yup.string().required(),
    location: yup.object({
      _long: yup.number().required(),
      _lat: yup.number().required(),
    }),

    photoURL: yup.string().url().nullable(),
  }),
  link: yup.string().optional().nullable(),
});

export type Advertisement = yup.InferType<typeof adSchema>;
