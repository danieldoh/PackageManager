const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({origin: true});

exports.auth = functions.https.onRequest((req: any, res: any) => {
  const handleError = (username: string, error: any) => {
    functions.logger.error({User: username}, error);
    res.sendStatus(500);
    return;
  };

  const handleResponse = (username: string, status: number, body: any) => {
    functions.logger.log(
      {User: username},
      {
        Response: {
          Status: status,
          Body: body,
        },
      }
    );
    if (body) {
      return res.status(200).json(body);
    }
    return res.sendStatus(status);
  };

  const username: string = req.body.username;
  try {
    return cors(req, res, async () => {
      if (req.method !== "POST") {
        return handleResponse(username, 403, "Not POST");
      }

      if (!username) {
        return handleResponse(username, 400, "No Username is found");
      }

      const password = req.body.password;
      if (!password) {
        return handleResponse(username, 400, "No Password is found");
      }

      const Admin = req.body.Admin;
      if (!Admin) {
        return handleResponse(username, 400, "No Admin is found");
      }
      if (Admin != "true" && Admin != "false") {
        return handleResponse(username, 400, "Should be either true or false");
      }

      const valid = await checkUsername(username, password, Admin);
      if (!valid[0]) {
        return handleResponse(username, 401, "Username is already taken.");
      }

      return handleResponse(username, 200, {token: valid[1]});
    });
  } catch (error) {
    return handleError(username, error);
  }
});

import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore(admin.apps[0]);

/**
 * Generate token for the username and store in the db
 * @param {string} username
 * @param {string} password
 * @param {string} Admin
 * @return {[boolean, string]}
 */
async function checkUsername(username: string, password: string, Admin: string): Promise<[boolean, string]> {
  const users = db.collection("users").doc(username);
  const doc = await users.get();
  if (!doc.exists) {
    const firebaseToken = await admin.auth().createCustomToken(username);
    const newUser = db.collection("users");
    await newUser.doc(username).set({
      Password: password,
      IdToken: firebaseToken,
      Admin: Admin,
    });
    console.log("action checking");
    return [true, firebaseToken];
  } else {
    return [false, "Failed"];
  }
}

