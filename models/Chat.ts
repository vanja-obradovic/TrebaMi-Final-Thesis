import * as yup from "yup";

export const chatSchema = yup.object({
  closed: yup.boolean(),
  createdAt: yup.number(),
  createdBy: yup.string(),
  id: yup.string(),
  members: yup.array().of(
    yup.object({
      displayName: yup.string(),
      photoURL: yup.string().url().nullable(),
      uid: yup.string(),
      isProvider: yup.boolean(),
    })
  ),
  modifiedAt: yup.number(),
  offer: yup.object({
    amount: yup.number(),
    // isAccepted: yup.boolean(),
    // isRejected: yup.boolean(),
  }),
  recentMessage: yup.object({
    messageText: yup.string().nullable(),
    readBy: yup.array().of(yup.string()),
    sentAt: yup.number().nullable(),
    sentBy: yup.string().nullable(),
  }),
  subject: yup.object({
    adTitle: yup.string(),
    aid: yup.string(),
    category: yup.string().oneOf(["products", "services"]),
    subcategory: yup.string(),
  }),
});

export type Chat = yup.InferType<typeof chatSchema>;
