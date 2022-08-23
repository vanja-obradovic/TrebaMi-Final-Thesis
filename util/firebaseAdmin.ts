// import admin from "firebase-admin";
// import { applicationDefault } from "firebase-admin/app";

// try {
//   admin.initializeApp({
//     credential: applicationDefault(),
//     databaseURL: "https://test-c3caf.firebaseio.com",
//   });
//   console.log("Initialized.");
// } catch (error) {
//   if (!/already exists/u.test(error.message)) {
//     console.error("Firebase admin initialization error", error.stack);
//   }
// }

// export const verifyToken = (userToken) => {
//   return admin
//     .auth()
//     .verifyIdToken(userToken)
//     .catch((err) => {throw err});
// };
