"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const firestore_1 = require("firebase-admin/firestore");
const admin = require("firebase-admin");
/**
 * Validate JWT token and check the access
 * @param {string} token
 * @returns {boolean}
 */
async function validation(token) {
    const db = (0, firestore_1.getFirestore)(admin.apps[0]);
    const userRef = db.collection("users").doc(token);
    const doc = await userRef.get();
    if (doc.exists) {
        const docData = doc.data();
        const access = docData["Admin"];
        if (access == 'true') {
            return true;
        }
        else {
            return false;
        }
    }
    return false;
}
exports.validation = validation;
//# sourceMappingURL=validate.js.map