"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const cors = require("cors")({ origin: true });
exports.auth = functions.https.onRequest((req, res) => {
    const handleError = (username, error) => {
        functions.logger.error({ User: username }, error);
        res.sendStatus(500);
        return;
    };
    const handleResponse = (username, status, body) => {
        functions.logger.log({ User: username }, {
            Response: {
                Status: status,
                Body: body,
            },
        });
        if (body) {
            return res.status(200).json(body);
        }
        return res.sendStatus(status);
    };
    const username = req.body.username;
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
                return handleResponse(username, 400, "Admin should be either true or false");
            }
            const valid = await checkUsername(username, password, Admin);
            if (!valid[0]) {
                return handleResponse(username, 401, "Invalid Username, already taken.");
            }
            return handleResponse(username, 200, { token: valid[1] });
        });
    }
    catch (error) {
        return handleError(username, error);
    }
});
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)(admin.apps[0]);
/**
 *
 * @param {string} username
 * @param {string} password
 * @return {boolean, string}
 */
async function checkUsername(username, password, Admin) {
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
        return [true, firebaseToken];
    }
    else {
        return [false, "Failed"];
    }
}
//# sourceMappingURL=auth.js.map