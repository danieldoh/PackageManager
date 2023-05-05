import 'jest';
//import * as functions from 'firebase-functions-test';
//const testEnv = functions();
import { auth } from '../src/auth';
import express from "express";
import request from "supertest";


const app = express();
app.use(express.json());
app.put("/authenticate", auth);



describe("PUT /authenticate", () => {
  test("(1) should return a 200 status code and a token if authentication is successful", async () => {
    const response = await request(app)
      .put("/authenticate")
      .send({username: "testuser", password: "testpassword", Admin: "false"})
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  }, 20000);

  test("(2) should return a 400 status code if the username is missing", async () => {
    const response = await request(app)
      .put("/authenticate")
      .send({password: "testpassword", Admin: "false"})
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
  });

  test("(3) should return a 400 status code if the password is missing", async () => {
    const response = await request(app)
      .put("/authenticate")
      .send({username: "testuser", Admin: "false"})
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
  });

  test("(4) should return a 400 status code if the Admin field is missing", async () => {
    const response = await request(app)
      .put("/authenticate")
      .send({username: "testuser", password: "testpassword"})
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
  });

  test("(5) should return a 400 status code if the Admin field is not either true or false", async () => {
    const response = await request(app)
      .put("/authenticate")
      .send({username: "testuser", password: "testpassword", Admin: "invalid"})
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
  });

});

