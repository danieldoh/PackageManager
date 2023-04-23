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
    const username = req.body.username;
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
            return res.status(200).json({ token: valid[1] });
        });
    }
    catch (error) {
        functions.logger.error({ User: username }, error);
        return res.sendStatus(500);
    }
};
exports.auth = auth;
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)(admin.apps[0]);
/**
 * Generate token for the username and store in the db
 * @param {string} username
 * @param {string} password
 * @param {string} Admin
 * @return {[boolean, string]}
 */
async function checkUsername(username, password, Admin) {
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
    }
    else {
        return [false, "Failed"];
    }
}
//# sourceMappingURL=auth.js.map