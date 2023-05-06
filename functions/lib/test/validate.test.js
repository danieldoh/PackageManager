"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase-admin/firestore");
require("jest");
const firebase_1 = require("../src/firebase");
const validate_1 = require("../src/validate");
const admin = require("firebase-admin");
const testToken = "testToken";
admin.initializeApp(firebase_1.firebaseConfig);
describe("Validation function", () => {
    const db = (0, firestore_1.getFirestore)(admin.apps[0]);
    test("(1) should return [true, username] if the user has admin access", async () => {
        const username = "adminUser";
        const userRef = db.collection("users").doc(testToken);
        await userRef.set({ Username: username, Admin: "true" });
        const result = await (0, validate_1.validation)(testToken);
        expect(result).toEqual([true, username]);
    });
    test("(2) should return [false, \"Undefined\"] if the user does not have admin access", async () => {
        const username = "regularUser";
        const userRef = db.collection("users").doc(testToken);
        await userRef.set({ Username: username, Admin: "false" });
        const result = await (0, validate_1.validation)(testToken);
        expect(result).toEqual([false, "Undefined"]);
    });
    test("(3) should return [true, username] if the default admin has admin access", async () => {
        const username = "defaultAdmin";
        const defaultRef = db.collection("Default Admin").doc(testToken);
        await defaultRef.set({ Username: username, Admin: "true" });
        const result = await (0, validate_1.validation)(testToken);
        expect(result).toEqual([true, username]);
    });
    test("(4) should return [false, \"Undefined\"] if the default admin does not have admin access", async () => {
        const username = "defaultAdmin";
        const defaultRef = db.collection("Default Admin").doc(testToken);
        await defaultRef.set({ Username: username, Admin: "false" });
        const result = await (0, validate_1.validation)(testToken);
        expect(result).toEqual([false, "Undefined"]);
    });
    test("(5) should return [false, \"Undefined\"] if the token does not exist in the database", async () => {
        const result = await (0, validate_1.validation)("invalidToken");
        expect(result).toEqual([false, "Undefined"]);
    });
});
//# sourceMappingURL=validate.test.js.map