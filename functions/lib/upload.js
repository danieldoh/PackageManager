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
exports.uploadFile = void 0;
const storage_1 = require("firebase/storage");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const https = __importStar(require("https"));
// import * as zlib from "zlib";
const buffer_1 = require("buffer");
const admin = require("firebase-admin");
const downloadFile = (url = "https://github.com/lodash/lodash/archive/master.zip") => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks = [];
            response
                .on("data", (chunk) => chunks.push(chunk))
                .on("end", () => {
                const buffer = buffer_1.Buffer.concat(chunks);
                const base64String = buffer.toString("base64");
                resolve(base64String);
            })
                .on("error", reject);
        });
    });
};
const uploadFile = async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
                let content = "";
                if (data.Content) {
                    content = data.Content;
                }
                else if (data.URL) {
                    console.log(data.URL);
                    const base64String = await downloadFile(data.URL);
                    content = base64String;
                }
                const file = content;
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const filename = metadata.ID + ".bin";
                const storageRef = (0, storage_1.ref)(storage, `${metadata.Name}/${filename}`);
                await (0, storage_1.uploadString)(storageRef, file, "base64");
                (0, storage_1.updateMetadata)(storageRef, metadata);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                const IdRef = db.collection("ID").doc(metadata.ID);
                const IdDoc = await IdRef.get();
                const doc = await packagesRef.get();
                if (!doc.exists || !IdDoc.exists) {
                    const url = await (0, storage_1.getDownloadURL)(storageRef);
                    const newPackage = db.collection(metadata.Name);
                    await newPackage.doc(metadata.Version).set({
                        Name: metadata.Name,
                        Version: metadata.Version,
                        ID: metadata.ID,
                        Download_URL: url,
                    });
                    const storageFolder = db.collection("storage");
                    await storageFolder.doc(metadata.Name).set({
                        Folder: metadata.Name,
                    });
                    const timeDate = new Date().toLocaleString();
                    const history = {
                        User: {
                            name: authentication[1],
                            isAdmin: authentication[0],
                        },
                        Date: timeDate,
                        PackageMetadata: {
                            Name: metadata.Name,
                            Version: metadata.Version,
                            Id: metadata.ID,
                        },
                        Action: "Upload",
                    };
                    const historyRef = db.collection(metadata.Name).doc("history");
                    const historyDoc = await historyRef.get();
                    if (historyDoc.exists) {
                        await newPackage.doc("history").update({
                            history: firestore_1.FieldValue.arrayUnion(history),
                        });
                    }
                    else {
                        await newPackage.doc("history").set({
                            history: [history],
                        });
                    }
                    const newID = db.collection("ID");
                    await newID.doc(metadata.ID).set({
                        Name: metadata.Name,
                        Version: metadata.Version,
                        ID: metadata.ID,
                        Download_URL: url,
                    });
                }
                else {
                    res.status(409).send("Package exists already.");
                }
                res.status(200).send(req.body);
            }
            catch (error) {
                console.error(error);
                res.status(500).send(error);
            }
        }
        else {
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set).");
    }
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=upload.js.map