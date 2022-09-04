import * as yup from "yup";

export const receiptSchema = yup.object({
  adTitle: yup.string(),
  aid: yup.string(),
  commented: yup.boolean(),
  completed: yup.boolean(),
  amount: yup.number(),
  displayName: yup.string(),
  quantity: yup.number(),
  timestamp: yup.number(),
  buyerID: yup.string(),
  sellerID: yup.string(),
  subcategory: yup.string(),
});

export type Receipt = yup.InferType<typeof receiptSchema>;
