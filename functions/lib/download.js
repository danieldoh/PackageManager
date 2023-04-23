"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
// import { initializeApp } from "firebase/app";
// import { firebaseConfig } from "./firebase";
const firestore_1 = require("firebase-admin/firestore");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
// get list of collections and remove 'token' from it
// and loop over the list of collections and check the versions by version pinning?
const downloadFile = async (req, res) => {
    const packageID = req.params["packageID"];
    const token = req.headers.authorization;
    if (token) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const idRef = db.collection("ID").doc(packageID);
                const idInfo = await idRef.get();
                if (idInfo.exists) {
                    const idData = idInfo.data();
                    const packageName = idData === null || idData === void 0 ? void 0 : idData["Name"];
                    const packageVersion = idData === null || idData === void 0 ? void 0 : idData["Version"];
                    const url = idData === null || idData === void 0 ? void 0 : idData["Download_URL"];
                    const info = {
                        metadata: {
                            Name: packageName,
                            Version: packageVersion,
                            ID: packageID,
                        },
                        data: {
                            Content: url,
                        },
                    };
                    res.status(200).send(info);
                }
                else {
                    res.status(404).send("Package does not exist.");
                }
                /* if (doc.exists) {
                  const docData: any = doc.data();
                  const url: string = docData["Download_URL"];
                  const xhr = new XMLHttpRequest();
                  xhr.responseType = 'blob';
                  xhr.onload = (event) => {
                    // const blob = xhr.response;
                  }
                  xhr.open('GET', url);
                  xhr.send()
                }
                console.log(versionPinning)*/
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err);
            }
        }
        else {
            res.status(401).send("Unauthorized");
        }
    }
    else {
        res.status(404).send("Token is undefined");
    }
};
exports.downloadFile = downloadFile;
//# sourceMappingURL=download.js.map