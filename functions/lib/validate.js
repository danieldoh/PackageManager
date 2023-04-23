"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const firestore_1 = require("firebase-admin/firestore");
const admin = require("firebase-admin");
/**
 * Validate JWT token and check the access
 * @param {string} token
 * @return {[boolean, string]}
 */
async function validation(token) {
    const db = (0, firestore_1.getFirestore)(admin.apps[0]);
    const userRef = db.collection("users").doc(token);
    const docUser = await userRef.get();
    const defaultRef = db.collection("Default Admin").doc(token);
    const docDefault = await defaultRef.get();
    if (docUser.exists) {
        const docData = docUser.data();
        const access = docData === null || docData === void 0 ? void 0 : docData["Admin"];
        const Username = docData === null || docData === void 0 ? void 0 : docData["Username"];
        if (access == "true") {
            return [true, Username];
        }
        else {
            return [false, "Undefined"];
        }
    }
    else if (docDefault.exists) {
        const docData = docDefault.data();
        const access = docData === null || docData === void 0 ? void 0 : docData["Admin"];
        const Username = docData === null || docData === void 0 ? void 0 : docData["Username"];
        if (access == "true") {
            return [true, Username];
        }
        else {
            return [false, "Undefined"];
        }
    }
    return [false, "Undefined"];
}
exports.validation = validation;
//# sourceMappingURL=validate.js.map