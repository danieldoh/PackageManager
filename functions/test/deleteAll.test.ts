import express from "express";
import "jest";
import request from "supertest";
import {deleteAll} from "../src/deleteAll";

const app = express();
app.use(express.json());
app.delete("/package/byName/:packageName", deleteAll);

describe("DELETE /package/byName/:packageName", () => {
  test("(1) should return a 200 status code if package and related data is deleted successfully", async () => {
    // Set up mock data
    const packageName = "test-package";
    const token = "valid-token";

    // Make request to endpoint
    const response = await request(app)
      .delete(`/package/byName/${packageName}`)
      .set("x-authorization", token);

    // Check response
    expect(response.status).toBe(200);
    expect(response.text).toEqual("Package is deleted");
  }, 2000);

  test("(2) should return a 400 status code if the authentication token is missing", async () => {
    // Set up mock data
    const packageName = "test-package";

    // Make request to endpoint
    const response = await request(app).delete(
      `/package/byName/${packageName}`
    );

    // Check response
    expect(response.status).toBe(400);
    expect(response.text).toEqual(
      "There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly."
    );
  }, 2000);

  test("(3) should return a 404 status code if the package does not exist", async () => {
    // Set up mock data
    const packageName = "non-existent-package";
    const token = "valid-token";

    // Make request to endpoint
    const response = await request(app)
      .delete(`/package/byName/${packageName}`)
      .set("x-authorization", token);

    // Check response
    expect(response.status).toBe(404);
    expect(response.text).toEqual("Package does not exist.");
  }, 2000);
});
