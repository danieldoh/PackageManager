/*import {Request, Response} from "express";
import {uploadFile} from "../src/upload";

describe("Upload file", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      headers: {
        "x-authorization": "test_token"
      },
      body: {
        data: {
          Content: "test content"
        },
        metadata: {
          Name: "test_package",
          Version: "1.0.0",
          ID: "test_id"
        }
      }
    };

    mockResponse = {
      status: jest.fn(() => mockResponse),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("(1) should upload a file successfully", async () => {
    await uploadFile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith({
      metadata: {
        Name: "test_package",
        Version: "1.0.0",
        ID: "test_id"
      },
      data: {
        Content: "test content"
      }
    });
  });

  it("(2) should return an error if the package already exists", async () => {
    // mock Firestore doc.exists to return true
    jest.mock("firebase-admin", () => ({
      apps: [{}],
      initializeApp: jest.fn(),
      getFirestore: jest.fn(),
      FieldValue: {
        arrayUnion: jest.fn()
      },
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(() => ({
              exists: true
            }))
          })),
          add: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
        }))
      }))
    }));

    await uploadFile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.send).toHaveBeenCalledWith("Package exists already.");
  });

  it("(3) should return an error if the request was unsuccessful", async () => {
    // mock fetch to return a non-200 HTTP status
    jest.mock("node-fetch", () => jest.fn(() => ({
      status: 400
    })));

    await uploadFile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith(expect.any(Error));
  });

  it("(4) should return an error if the authentication token is invalid", async () => {
    // mock validation function to return false
    jest.mock("./validate", () => ({
      validation: jest.fn(() => [false, ""])
    }));

    await uploadFile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("The AuthenticationToken is invalid.");
  });

  it("(5) should return an error if there are missing fields in the request body", async () => {
    // remove data.Content field
    delete mockRequest.body.data.Content;

    await uploadFile(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.send).toHaveBeenCalledWith("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set).");
  });
});*/






/*
import request from 'supertest';
import express from 'express';
import { uploadFile } from '../src/upload';

const app = express();
app.use(express.json());
app.post('/package', uploadFile);

describe('GET /package/:packageID', () => {
  test('responds with 200 and package content if the package exists', async () => {
    const res = await request(app).get('/package/123');
    expect(res.statusCode).toEqual(200);
    expect(res.type).toEqual('application/octet-stream');
    // You can also check the contents of the response, e.g.:
    // expect(res.body).toEqual(/* expected package content );
  });

  test('responds with 404 if the package does not exist', async () => {
    const res = await request(app).get('/package/unknown-package-id');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: 'Package not found.' });
  });
});


describe('POST /package', () => {
  test('responds with 200 and success message', async () => {
    const res = await request(app)
      .post('/package')
      .attach('file', '__tests__/files/test_package.zip'); // replace with path to test package file

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'Package uploaded successfully.' });
  });

  test('responds with 400 if no file attached', async () => {
    const res = await request(app).post('/package');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'No file attached.' });
  });
});

*/

import request from "supertest";
import express from "express";
import { uploadFile } from '../src/upload';
//import { firebaseConfig } from "../src/firebase";
//import admin from 'firebase-admin';

const app = express();
app.use(express.json());
app.post('/package', uploadFile);

//admin.initializeApp(firebaseConfig);

describe("POST /package", () => {
  it("(1) responds with 200 and success message", async () => {
    const res = await request(app)
      .post("/package")
      .attach("file", "test/fixtures/test.txt");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: "File uploaded successfully." });
  });

  it("(2) responds with 400 if no file attached", async () => {
    const res = await request(app).post("/package");

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: "No file attached." });
  });
});

describe("GET /package/:packageID", () => {
  it("(3) responds with 200 and the package content", async () => {
    const res = await request(app).get("/package/my-package-id");

    expect(res.statusCode).toEqual(200);
    expect(res.header["content-type"]).toEqual("application/octet-stream");
    expect(res.body.toString()).toEqual("hello world\n");
  });

  it("(4) responds with 404 if package is not found", async () => {
    const res = await request(app).get("/package/unknown-package-id");

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "Package not found." });
  });
});
