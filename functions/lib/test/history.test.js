"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("jest");
const supertest_1 = __importDefault(require("supertest"));
const history_1 = require("../src/history");
jest.mock("../src/validate", () => ({
    validation: jest.fn().mockResolvedValue([true, ""]),
}));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/:packageName/history", history_1.history);
describe("GET /:packageName/history", () => {
    test("(1) should return a 200 status code and all history if package exists", async () => {
        // create mock data for test
        const packageName = "test-package";
        const mockData = {
            history: [
                {
                    User: { name: "test-user", isAdmin: true },
                    Date: "2022-01-01",
                    PackageMetadata: {
                        Name: "test-package",
                        Version: "1.0.0",
                        Id: "test-id",
                    },
                    Action: "test-action",
                },
            ],
        };
        // mock Firestore's get method to return the mock data
        const getMock = jest.fn(() => ({ exists: true, data: () => mockData }));
        const collectionMock = jest.fn(() => ({
            doc: jest.fn(() => ({ get: getMock })),
        }));
        const db = { collection: collectionMock };
        const getFirestoreMock = jest.fn(() => db);
        jest.mock("firebase-admin/firestore", () => ({
            getFirestore: getFirestoreMock,
        }));
        const response = await (0, supertest_1.default)(app).get(`/${packageName}/history`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData.history);
    });
    test("(2) should return a 404 status code if package does not exist", async () => {
        // create mock data for test
        const packageName = "test-package";
        // mock Firestore's get method to return null
        const getMock = jest.fn(() => ({ exists: false }));
        const collectionMock = jest.fn(() => ({
            doc: jest.fn(() => ({ get: getMock })),
        }));
        const db = { collection: collectionMock };
        const getFirestoreMock = jest.fn(() => db);
        jest.mock("firebase-admin/firestore", () => ({
            getFirestore: getFirestoreMock,
        }));
        const response = await (0, supertest_1.default)(app).get(`/${packageName}/history`);
        expect(response.status).toBe(404);
    });
    test("(3) should return a 400 status code if missing field(s) in request", async () => {
        const response = await (0, supertest_1.default)(app).get("/");
        expect(response.status).toBe(400);
    });
});
//# sourceMappingURL=history.test.js.map