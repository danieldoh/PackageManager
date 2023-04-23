import * as functions from "firebase-functions";
import {Request, Response} from "express";
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({origin: true});


const auth = (req: Request, res: Response) => {
  const username: string = req.body.username;
  try {
    return cors(req, res, async () => {
      if (!username) {
        return res.status(400).json("No Username is Found");
      }

      const password = req.body.password;
      if (!password) {
        return res.status(400).json("No Password is Found");
      }

      const Admin = req.body.Admin;
      if (!Admin) {
        return res.status(400).json("No Admin is Found");
      }
      if (Admin != "true" && Admin != "false") {
        return res.status(400).json("Should be either true or false");
      }

      const valid = await checkUsername(username, password, Admin);
      if (!valid[0]) {
        return res.status(401).json("Username is already taken. Invalid.");
      }

      return res.status(200).json({token: valid[1]});
    });
  } catch (error) {
    functions.logger.error({User: username}, error);
    return res.sendStatus(500);
  }
};

import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore(admin.apps[0]);

/**
 * Generate token for the username and store in the db
 * @param {string} username
 * @param {string} password
 * @param {string} Admin
 * @return {[boolean, string]}
 */
async function checkUsername(
  username: string,
  password: string,
  Admin: string
): Promise<[boolean, string]> {
  const users = db.collection("users").doc(username);
  const doc = await users.get();
  if (!doc.exists) {
    const firebaseToken = await admin.auth().createCustomToken(username);
    const idtoken = "Bearer " + firebaseToken;
    const newToken = db.collection("users");
    await newToken.doc(idtoken).set({
      Username: username,
      Password: password,
      IdToken: idtoken,
      Admin: Admin,
    });
    return [true, idtoken];
  } else {
    return [false, "Failed"];
  }
}

export {auth};
