"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const storage_1 = require("firebase/storage");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const validate_1 = require("./validate");
exports.updateFile = functions.https.onRequest(async (req, res) => {
    const authorizationHeader = req.headers.authorization;
    let token;
    if (authorizationHeader) {
        token = authorizationHeader;
        console.log(token);
        console.log(await (0, validate_1.validation)(token));
        if (await (0, validate_1.validation)(token)) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
                const file = data.Content;
                const firebaseConfig = {
                    apiKey: "AIzaSyBv0YpZub_rr-nQ_fil5DhUjQGpPV9e6jQ",
                    authDomain: "rest-api-b6587.firebaseapp.com",
                    projectId: "rest-api-b6587",
                    storageBucket: "rest-api-b6587.appspot.com",
                    messagingSenderId: "276179708375",
                    appId: "1:276179708375:web:d18b52c6e02dcc03f84392",
                    measurementId: "G-13Y9JC2Y1S",
                };
                const firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const storageRef = (0, storage_1.ref)(storage, `package/${metadata.ID}`);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                const doc = await packagesRef.get();
                if (doc.exists) {
                    console.log(doc.data());
                    const docData = doc.data();
                    console.log(docData);
                    const name = docData['Name'];
                    console.log(name);
                    const version = docData['Version'];
                    console.log(version);
                    const id = docData['ID'];
                    console.log(id);
                    if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
                        await (0, storage_1.uploadString)(storageRef, file, "base64");
                        console.log("Updated the file");
                        await (0, storage_1.updateMetadata)(storageRef, metadata);
                        res.status(200).send("Updated this version of the pacakge");
                    }
                    else {
                        console.error("Metadata is not founded.");
                        res.status(500).send("Metadata is not founded.");
                    }
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).send(error);
            }
        }
        else {
            res.status(401).send("Unauthorized");
        }
    }
    else {
        res.status(404).send("Token is undefined");
    }
});
//# sourceMappingURL=update.js.map