import * as functions from "firebase-functions";
import {Request, Response} from "express";
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({origin: true});

interface userJson {
  User: {
    name: string,
    isAdmin: boolean,
  };
  Secret: {
    password: string,
  };
}

const auth = (req: Request, res: Response) => {
  const info: userJson = req.body;
  console.log(`${info}`);
  const user = info["User"];
  const secret = info["Secret"];
  const username = user["name"];
  console.log(username);
  const isAdmin = user["isAdmin"];
  const password = secret["password"];
  try {
    return cors(req, res, async () => {
      if (!username) {
        console.log("Authenticate: no username");
        return res.status(400).send("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
      }
      if (!password) {
        console.log("Authenticate: no password");
        return res.status(400).json("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
      }
      if (!isAdmin) {
        console.log("Authenticate: no isAdmin");
        return res.status(400).json("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
      }
      if (isAdmin != true && isAdmin != false) {
        console.log("Authenticate: wrong format of isAdmin");
        return res.status(400).json("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
      }
      const valid = await checkUsername(username, password, isAdmin);
      if (!valid[0]) {
        console.log(`The user or password is invalid, Username: ${username} Password: ${password}`);
        return res.status(401).json("The user or password is invalid");
      }
      console.log("Authentication: Token is created");
      return res.status(200).send(valid[1]);
    });
  } catch (error) {
    functions.logger.error({User: username}, error);
    console.error(error);
    return res.status(400).send("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
  }
};

import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore(admin.apps[0]);

/**
 * Generate token for the username and store in the db
 * @param {string} username
 * @param {string} password
 * @param {boolean} Admin
 * @return {[boolean, string]}
 */
async function checkUsername(
  username: string,
  password: string,
  Admin: boolean
): Promise<[boolean, string]> {
  const users = db.collection("users").doc(username);
  const doc = await users.get();
  if (!doc.exists) {
    const firebaseToken = await admin.auth().createCustomToken(username);
    console.log("Token is created");
    const idtoken = "Bearer " + firebaseToken;
    const newToken = db.collection("token");
    await newToken.doc(idtoken).set({
      Username: username,
      Password: password,
      IdToken: idtoken,
      Admin: Admin,
    });
    const newUser = db.collection("users");
    await newUser.doc(username).set({
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
