"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({ origin: true });
const auth = (req, res) => {
    console.log(`Auth: ${JSON.stringify(req.body)}`);
    const info = req.body;
    // console.log(`${info}`);
    const user = info["User"];
    const secret = info["Secret"];
    const username = user["name"];
    // console.log(username);
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
    }
    catch (error) {
        functions.logger.error({ User: username }, error);
        console.error(error);
        return res.status(400).send("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
    }
};
exports.auth = auth;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)(admin.apps[0]);
/**
 * Generate token for the username and store in the db
 * @param {string} username
 * @param {string} password
 * @param {boolean} Admin
 * @return {[boolean, string]}
 */
async function checkUsername(username, password, Admin) {
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
        if (Admin == true) {
            const users = db.collection("Default Admin");
            await users.doc(idtoken).set({
                Username: username,
                Password: password,
                IdToken: idtoken,
                Admin: "true",
            });
        }
        return [true, idtoken];
    }
    else {
        return [false, "Failed"];
    }
}
//# sourceMappingURL=auth.js.map