import express from 'express';
import 'firebase/firestore';
import request from 'supertest';
import { fileDelete } from '../src/delete';
//const {firestore} = require("../src/firebaseAdmin");
const { firestore } = require('firebase-admin');
jest.mock('../src/firebase');

describe('fileDelete', () => {
  it('(1) should delete a package file and its corresponding document', async () => {
    const metadata = {
      Name: 'test-package',
      Version: '1.0.0',
      ID: 'test-package-1.0.0',
    };
    const db = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      delete: jest.fn().mockResolvedValueOnce(undefined),
    };
    firestore.mockReturnValueOnce(db);

    const deleteObject = jest.fn().mockResolvedValueOnce(undefined);
    const storageRef = {
      child: jest.fn().mockReturnThis(),
      delete: deleteObject,
    };
    const ref = jest.fn().mockReturnValueOnce(storageRef);

    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);

    const res = await request(app)
      .delete('/package/test-package-1.0.0')
      .send({ metadata });

    expect(res.status).toEqual(200);
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith('test-package/test-package-1.0.0.bin');
    expect(db.collection).toHaveBeenCalledWith('test-package');
    expect(db.doc).toHaveBeenCalledWith('1.0.0');
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it('(2) should return 404 if the package does not exist', async () => {
    const metadata = {
      Name: 'non-existent-package',
      Version: '1.0.0',
      ID: 'non-existent-package-1.0.0',
    };
    const db = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      delete: jest
        .fn()
        .mockRejectedValueOnce(new Error('Document does not exist.')),
    };
    firestore.mockReturnValueOnce(db);

    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);

    const res = await request(app)
      .delete('/package/non-existent-package-1.0.0')
      .send({ metadata });

    expect(res.status).toEqual(404);
  });

  it('(3) should return 400 if the authentication token is missing or invalid', async () => {
    const metadata = {
      Name: 'test-package',
      Version: '1.0.0',
      ID: 'test-package-1.0.0',
    };
    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);

    // Missing token
    let res = await request(app)
      .delete('/package/test-package-1.0.0')
      .send({ metadata });
    expect(res.status).toEqual(400);

    // Invalid token
    res = await request(app)
      .delete('/package/test-package-1.0.0')
      .set('x-authorization', 'invalid-token')
      .send({ metadata });
    expect(res.status).toEqual(400);
  }, 10000);

  it('(4) should return 400 if the package ID is missing or malformed', async () => {
    const metadata = {
      Name: 'test-package',
      Version: '1.0.0',
      ID: 'test-package-1.0.0',
    };
    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);

    // Test with missing package ID
    let res = await request(app).delete('/package/').send({ metadata });
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: 'Missing package ID' });

    // Test with malformed package ID
    res = await request(app)
      .delete('/package/test-package-1.0.0.bin')
      .send({ metadata });
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: 'Malformed package ID' });
  });

  it('(5) should return 404 if package does not exist', async () => {
    const metadata = {
      Name: 'test-package',
      Version: '1.0.0',
      ID: 'test-package-1.0.0',
    };
    const db = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      delete: jest
        .fn()
        .mockRejectedValueOnce(new Error('Document does not exist')),
    };
    firestore.mockReturnValueOnce(db);

    const deleteObject = jest
      .fn()
      .mockRejectedValueOnce(new Error('Object does not exist'));
    const storageRef = {
      child: jest.fn().mockReturnThis(),
      delete: deleteObject,
    };
    const ref = jest.fn().mockReturnValueOnce(storageRef);

    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);

    const res = await request(app)
      .delete('/package/test-package-1.0.0')
      .send({ metadata });

    expect(res.status).toEqual(404);
    expect(deleteObject).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith('test-package/test-package-1.0.0.bin');
    expect(db.collection).toHaveBeenCalledWith('test-package');
    expect(db.doc).toHaveBeenCalledWith('1.0.0');
    expect(db.delete).toHaveBeenCalledTimes(1);
  });

  it('(6) should return 400 if authentication token is missing or invalid', async () => {
    const metadata = {
      Name: 'test-package',
      Version: '1.0.0',
      ID: 'test-package-1.0.0',
    };
    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);

    const res1 = await request(app)
      .delete('/package/test-package-1.0.0')
      .send({ metadata });

    expect(res1.status).toEqual(400);

    const res2 = await request(app)
      .delete('/package/test-package-1.0.0')
      .set('x-authorization', 'invalid-token')
      .send({ metadata });

    expect(res2.status).toEqual(400);
  }, 10000);

  it('(7) should return 404 if packageID is missing', async () => {
    const app = express();
    app.use(express.json());
    app.delete('/package/:packageID', fileDelete);
    const metadata = {
      Name: 'test-package',
      Version: '1.0.0',
      ID: 'test-package-1.0.0',
    };

    const res = await request(app)
      .delete('/package/')
      .set('x-authorization', 'valid-token')
      .send({ metadata });

    expect(res.status).toEqual(404);
  });
});

/*
import {initApp} from "../src/firebaseAdmin";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "../src/firebase";
import express from "express";
import request from "supertest";
import { fileDelete } from "../src/delete";
import {auth} from "../src/auth";
const admin = require("firebase-admin");

const app = express();
app.use(express.json());
app.put('/authenticate', auth);
app.delete("/packages/:packageID", fileDelete);

describe("DELETE /packages/:packageID", () => {
  test("(1) should return a 200 status code if package is successfully deleted", async () => {
    const firebaseApp = initApp(firebaseConfig);
    const storage = getStorage(firebaseApp);
    const db = getFirestore();
    const metadata = {
      Name: "testPackage",
      Version: "1.0.0",
      ID: "testID",
    };
    const filename = metadata.ID + ".bin";
    const storageRef = ref(storage, `${metadata.Name}/${filename}`);
    await storageRef.put(new Uint8Array([1, 2, 3]));
    await db.collection(metadata.Name).doc(metadata.Version).set({
      ID: metadata.ID,
    });
    const token = "valid_token";
    const response = await request(app)
      .delete(`/packages/${metadata.ID}`)
      .set("X-Authorization", token);
    expect(response.status).toBe(200);
    const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
    const packagesDoc = await packagesRef.get();
    expect(packagesDoc.exists).toBe(false);
  });

  test("(2) should return a 400 status code if the X-Authorization header is missing", async () => {
    const firebaseApp = initApp(firebaseConfig);
    const storage = getStorage(firebaseApp);
    const db = getFirestore();
    const metadata = {
      Name: "testPackage",
      Version: "1.0.0",
      ID: "testID",
    };
    const filename = metadata.ID + ".bin";
    const storageRef = ref(storage, `${metadata.Name}/${filename}`);
    await storageRef.put(new Uint8Array([1, 2, 3]));
    await db.collection(metadata.Name).doc(metadata.Version).set({
      ID: metadata.ID,
    });
    const response = await request(app).delete(`/packages/${metadata.ID}`);
    expect(response.status).toBe(400);
  });

  test("(3) should return a 400 status code if the packageID is missing", async () => {
    const firebaseApp = initApp(firebaseConfig);
    const storage = getStorage(firebaseApp);
    const db = getFirestore();
    const metadata = {
      Name: "testPackage",
      Version: "1.0.0",
      ID: "testID",
    };
    const filename = metadata.ID + ".bin";
    const storageRef = ref(storage, `${metadata.Name}/${filename}`);
    await storageRef.put(new Uint8Array([1, 2, 3]));
    await db.collection(metadata.Name).doc(metadata.Version).set({
      ID: metadata.ID,
    });
    const token = "valid_token";
    const response = await request(app)
      .delete("/packages/")
      .set("X-Authorization", token);
    expect(response.status).toBe(400);
  });

  test("(4) should return a 404 status code if the package does not exist", async () => {
    const firebaseApp = initApp(firebaseConfig);
    const storage = getStorage(firebaseApp);
    const metadata = {
      Name: "testPackage",
      Version: "1.0.0",
      ID: "testPackage-1.0.0"
    };
    const filename = metadata.ID + ".bin";
    const storageRef = ref(storage, `${metadata.Name}/${filename}`);
    const db = getFirestore(admin.apps[0]);
    const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
    
    // Delete package if it exists
    try {
      await packagesRef.delete();
      await deleteObject(storageRef);
    } catch (err) {}
    const token = "valid_token";
    const response = await request(app)
      .delete(`/packages/${metadata.ID}`)
      .set("x-authorization", token)
      .set("Accept", "application/json");
  
    expect(response.status).toBe(404);
    expect(response.body).toBe("Package does not exist.");
  });
});  
*/
