"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firestore_1 = require("firebase-admin/firestore");
const supertest_1 = __importDefault(require("supertest"));
const download_1 = require("../src/download");
const firebase_1 = require("../src/firebase");
const admin = require("firebase-admin");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/packages/:packageID/download", download_1.downloadID);
admin.initializeApp(firebase_1.firebaseConfig);
afterAll(async () => {
    // Clean up the database after all tests have run
    const db = (0, firestore_1.getFirestore)(admin.app[0]);
    const collections = await db.listCollections();
    for (const collection of collections) {
        const documents = await collection.listDocuments();
        for (const document of documents) {
            await document.delete();
        }
    }
});
describe("GET /packages/:packageID/download", () => {
    test("should return 200 and the package information when given a valid package ID and valid authentication token", async () => {
        const db = (0, firestore_1.getFirestore)(admin.apps[0]);
        const idRef = db.collection("ID").doc("package1");
        await idRef.set({
            Name: "MyPackage",
            Version: "1.0.0",
            Download_URL: "http://example.com/mypackage-1.0.0.zip",
        });
        // Send a request to the API with a valid authentication token
        const authToken = "valid-auth-token";
        const response = await (0, supertest_1.default)(app)
            .get("/packages/package1/download")
            .set("x-authorization", authToken);
        // Check the response
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            metadata: {
                Name: "MyPackage",
                Version: "1.0.0",
                ID: "package1",
            },
            data: {
                Content: "http://example.com/mypackage-1.0.0.zip",
            },
        });
    });
    test("should return 404 when given a non-existent package ID", async () => {
        // Send a request to the API with a valid authentication token
        const authToken = "valid-auth-token";
        const response = await (0, supertest_1.default)(app)
            .get("/packages/non-existent-package/download")
            .set("x-authorization", authToken);
        // Check the response
        expect(response.status).toBe(404);
        expect(response.text).toBe("Package does not exist.");
    });
    test("should return 401 when given an invalid authentication token", async () => {
        // Send a request to the API with an invalid authentication token
        const authToken = "invalid-auth-token";
        const response = await (0, supertest_1.default)(app)
            .get("/packages/package1/download")
            .set("x-authorization", authToken);
        // Check the response
        expect(response.status).toBe(401);
        expect(response.text).toBe("Unauthorized");
    });
    test("should return 404 when no authentication token is provided", async () => {
        // Send a request to the API without an authentication token
        const response = await (0, supertest_1.default)(app).get("/packages/package1/download");
        // Check the response
        expect(response.status).toBe(404);
        expect(response.text).toBe("Token is undefined");
    });
});
//# sourceMappingURL=download.test.js.map