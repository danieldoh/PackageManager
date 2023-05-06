import express from "express";
import "jest";
import request from "supertest";
import {reset} from "../src/reset";

// Mock the validation function to return true
jest.mock("../src/validate", () => ({
  validation: () => [true, ""],
}));

describe("reset", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.put("/reset", reset);
  });

  test("should return a 200 status code and a success message if authentication is successful", async () => {
    const response = await request(app)
      .put("/reset")
      .set("Accept", "application/json")
      .set("x-authorization", "validtoken");

    expect(response.status).toBe(200);
    expect(response.text).toEqual("Registry is reset");
  });

  test("should return a 400 status code if the authentication token is missing", async () => {
    const response = await request(app)
      .put("/reset")
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.text).toEqual(
      "There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid."
    );
  });

  test("should return a 401 status code if the authentication token is invalid", async () => {
    jest.mock("../src/validate", () => ({
      validation: () => [false, ""],
    }));

    const response = await request(app)
      .put("/reset")
      .set("Accept", "application/json")
      .set("x-authorization", "invalidtoken");

    expect(response.status).toBe(401);
    expect(response.text).toEqual(
      "You do not have permission to reset the registry."
    );
  });

  test("should return a 404 status code if a package does not exist", async () => {
    jest.spyOn(console, "log").mockImplementation();

    const response = await request(app)
      .put("/reset")
      .set("Accept", "application/json")
      .set("x-authorization", "validtoken");

    expect(response.status).toBe(404);
    expect(response.text).toEqual("Package does not exist.");
  });
});
