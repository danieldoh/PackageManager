"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("jest");
const supertest_1 = __importDefault(require("supertest"));
const reset_1 = require("../src/reset");
// Mock the validation function to return true
jest.mock("../src/validate", () => ({
    validation: () => [true, ""],
}));
describe("reset", () => {
    let app;
    beforeEach(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.put("/reset", reset_1.reset);
    });
    test("should return a 200 status code and a success message if authentication is successful", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/reset")
            .set("Accept", "application/json")
            .set("x-authorization", "validtoken");
        expect(response.status).toBe(200);
        expect(response.text).toEqual("Registry is reset");
    });
    test("should return a 400 status code if the authentication token is missing", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/reset")
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
        expect(response.text).toEqual("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    });
    test("should return a 401 status code if the authentication token is invalid", async () => {
        jest.mock("../src/validate", () => ({
            validation: () => [false, ""],
        }));
        const response = await (0, supertest_1.default)(app)
            .put("/reset")
            .set("Accept", "application/json")
            .set("x-authorization", "invalidtoken");
        expect(response.status).toBe(401);
        expect(response.text).toEqual("You do not have permission to reset the registry.");
    });
    test("should return a 404 status code if a package does not exist", async () => {
        jest.spyOn(console, "log").mockImplementation();
        const response = await (0, supertest_1.default)(app)
            .put("/reset")
            .set("Accept", "application/json")
            .set("x-authorization", "validtoken");
        expect(response.status).toBe(404);
        expect(response.text).toEqual("Package does not exist.");
    });
});
//# sourceMappingURL=reset.test.js.map