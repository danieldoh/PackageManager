/*

import request from "supertest";
import { uploadFile } from '../src/upload';
import express from "express";

describe("Test update function", () => {
  let token: string;

  beforeAll(async () => {
    // Authenticate the user and get an authentication token
    const authResponse = await request(app).post("/auth").send({
      username: "user1",
      password: "password",
    });
    token = authResponse.body.token;
  });
  const app = express();

  test("(1) Update an existing user", async () => {
    const updateData = {
      name: "updated name",
      email: "updated@example.com",
      password: "newpassword",
    };
    const response = await request(app)
      .put("/users/user1")
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User updated successfully");

    // Check that the user data was updated in the database
    const userResponse = await request(app)
      .get("/users/user1")
      .set("Authorization", `Bearer ${token}`);
    expect(userResponse.status).toBe(200);
    expect(userResponse.body.name).toBe("updated name");
    expect(userResponse.body.email).toBe("updated@example.com");
  });

  test("(2) Update a non-existent user", async () => {
    const updateData = {
      name: "updated name",
      email: "updated@example.com",
      password: "newpassword",
    };
    const response = await request(app)
      .put("/users/nonexistentuser")
      .send(updateData)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});
*/


// 2nd test
import { auth } from '../src/auth';
import express from 'express';
import request from 'supertest';

const app = express();
app.use(express.json());
app.put('/authenticate', auth);

describe('PUT /authenticate', () => {
  test('(1) should return a 200 status code and a token if authentication is successful', async () => {
    const response = await request(app)
      .put('/authenticate')
      .send({ username: 'testuser', password: 'testpassword', Admin: 'false' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  }, 20000);

  test('(2) should return a 400 status code if the username is missing', async () => {
    const response = await request(app)
      .put('/authenticate')
      .send({ password: 'testpassword', Admin: 'false' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });

  test('(3) should return a 400 status code if the password is missing', async () => {
    const response = await request(app)
      .put('/authenticate')
      .send({ username: 'testuser', Admin: 'false' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });

  test('(4) should return a 400 status code if the Admin field is missing', async () => {
    const response = await request(app)
      .put('/authenticate')
      .send({ username: 'testuser', password: 'testpassword' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });

  test('(5) should return a 400 status code if the Admin field is not either true or false', async () => {
    const response = await request(app)
      .put('/authenticate')
      .send({ username: 'testuser', password: 'testpassword', Admin: 'invalid' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });
});
