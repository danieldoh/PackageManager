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
exports.fileDownload = void 0;
const functions = __importStar(require("firebase-functions"));
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
//import { getFirestore } from "firebase-admin/firestore";
//import { firebaseApp } from "../services/firebase";
const firebaseConfig = (0, app_1.initializeApp)({
    apiKey: "AIzaSyBv0YpZub_rr-nQ_fil5DhUjQGpPV9e6jQ",
    authDomain: "rest-api-b6587.firebaseapp.com",
    projectId: "rest-api-b6587",
    storageBucket: "rest-api-b6587.appspot.com",
    messagingSenderId: "276179708375",
    appId: "1:276179708375:web:d18b52c6e02dcc03f84392",
    measurementId: "G-13Y9JC2Y1S",
});
exports.fileDownload = functions.https.onRequest(async (req, res) => {
    try {
        const storage = (0, storage_1.getStorage)(firebaseConfig);
        const storageRef = (0, storage_1.ref)(storage);
        // Points to 'Package'
        const packageRef = (0, storage_1.ref)(storageRef, 'package');
        // Points to package/Name
        const fileName = '${metadata.Name}';
        const nameRef = (0, storage_1.ref)(packageRef, fileName);
        // File-path is 'package/Name'
        const path = nameRef.fullPath;
        // File-name is 'Name' whatever stored in package from Storage
        //const name = nameRef.name;
        // Create a reference with an initial file path and name
        //const pathRef = ref(packageRef, name);
        // Create a ref from a GCS(Google Cloud Storage URI)
        const gcsRef = (0, storage_1.ref)(storage, `gs://bucket/${path}`);
        // Create a ref from an HTTPS URL
        //const httpsRef = ref(storage, 'https://console.firebase.google.com/u/0/project/rest-api-b6587/storage/rest-api-b6587.appspot.com/files/~2Fpackage?hl=ko');
        // Storage download by url
        (0, storage_1.getDownloadURL)(gcsRef)
            .then((url) => {
            // url is download URL for 'package/name'
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = (event) => {
                //const blob = xhr.response;
            };
            xhr.open('GET', url);
            xhr.send();
        })
            .catch((err) => {
            switch (err.code) {
                case 'storage/object-not-found':
                    console.log('File does not exist.');
                    break;
                case 'storage/unauthorized':
                    console.log('Do not have permission to access to download.');
                    break;
                case 'storage/canceled':
                    console.log('Canceled the upload.');
                    break;
                case 'storage/unknown':
                    console.log('Unknown error occurred, inspect the server response.');
                    break;
                case 'storage/invalid-url':
                    console.log('Unvalid URL provided.');
                    break;
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
    /*
    getDownloadURL(storageRef)
      .then((url) => {
        console.log(url);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
      */
});
//# sourceMappingURL=download.js.map