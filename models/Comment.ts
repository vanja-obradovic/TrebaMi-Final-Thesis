import * as yup from "yup";

export const commenterSchema = yup.object({
  uid: yup.string(),
  displayName: yup.string(),
  photoURL: yup.string().url().notRequired(),
});

export const commentSchema = yup.object({
  title: yup.string().required(),
  rating: yup.number().nullable(),
  comment: yup.string().required(),
  timestamp: yup.number().required(),
  commenter: yup.object().shape(commenterSchema.fields),
});

export type Comment = yup.InferType<typeof commentSchema>;
export type Commenter = yup.InferType<typeof commenterSchema>;
