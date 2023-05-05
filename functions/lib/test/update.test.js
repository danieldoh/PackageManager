"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const auth_1 = require("../src/auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.put("/authenticate", auth_1.auth);
describe("PUT /authenticate", () => {
    test("(1) should return a 200 status code and a token if authentication is successful", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/authenticate")
            .send({ username: "testuser", password: "testpassword", Admin: "false" })
            .set("Accept", "application/json");
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    }, 20000);
    test("(2) should return a 400 status code if the username is missing", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/authenticate")
            .send({ password: "testpassword", Admin: "false" })
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
    });
    test("(3) should return a 400 status code if the password is missing", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/authenticate")
            .send({ username: "testuser", Admin: "false" })
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
    });
    test("(4) should return a 400 status code if the Admin field is missing", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/authenticate")
            .send({ username: "testuser", password: "testpassword" })
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
    });
    test("(5) should return a 400 status code if the Admin field is not either true or false", async () => {
        const response = await (0, supertest_1.default)(app)
            .put("/authenticate")
            .send({
            username: "testuser",
            password: "testpassword",
            Admin: "invalid",
        })
            .set("Accept", "application/json");
        expect(response.status).toBe(400);
    });
});
//# sourceMappingURL=update.test.js.map