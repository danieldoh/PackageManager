const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = JSON.parse(fs.readFileSync("../service-account.json"));

export const initApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "your-database-url"
});
