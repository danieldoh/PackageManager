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
        console.log("validate: found the user");
        const docData = docUser.data();
        const access = docData === null || docData === void 0 ? void 0 : docData["Admin"];
        const Username = docData === null || docData === void 0 ? void 0 : docData["Username"];
        if (access == "true") {
            console.log("validate: isAdmin");
            return [true, Username];
        }
        else {
            console.log("validate: not isAdmin");
            return [false, "Undefined"];
        }
    }
    else if (docDefault.exists) {
        console.log("validate: found the default user");
        const docData = docDefault.data();
        const access = docData === null || docData === void 0 ? void 0 : docData["Admin"];
        const Username = docData === null || docData === void 0 ? void 0 : docData["Username"];
        if (access == "true") {
            console.log("validate: default isAdmin");
            return [true, Username];
        }
        else {
            console.log("validate: default not isAdmin");
            return [false, "Undefined"];
        }
    }
    console.log("validate: not found any user and default user");
    return [false, "Undefined"];
}
exports.validation = validation;
//# sourceMappingURL=validate.js.map