import * as yup from "yup";

export const messageSchema = yup.object({
  messageText: yup.string(),
  sentAt: yup.number(),
  sentBy: yup.string(),
});

export type Message = yup.InferType<typeof messageSchema>;
