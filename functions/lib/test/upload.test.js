"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const upload_1 = require("../src/upload");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/package", upload_1.uploadFile);
describe("POST /package", () => {
    it("(1) responds with 200 and success message", async () => {
        const res = await (0, supertest_1.default)(app)
            .post("/package")
            .attach("file", "test/fixtures/test.txt");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: "File uploaded successfully." });
    });
    it("(2) responds with 400 if no file attached", async () => {
        const res = await (0, supertest_1.default)(app).post("/package");
        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: "No file attached." });
    });
});
describe("GET /package/:packageID", () => {
    it("(3) responds with 200 and the package content", async () => {
        const res = await (0, supertest_1.default)(app).get("/package/my-package-id");
        expect(res.statusCode).toEqual(200);
        expect(res.header["content-type"]).toEqual("application/octet-stream");
        expect(res.body.toString()).toEqual("hello world\n");
    });
    it("(4) responds with 404 if package is not found", async () => {
        const res = await (0, supertest_1.default)(app).get("/package/unknown-package-id");
        expect(res.statusCode).toEqual(404);
        expect(res.body).toEqual({ error: "Package not found." });
    });
});
//# sourceMappingURL=upload.test.js.map