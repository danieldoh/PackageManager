"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestionURL = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const ingestionURL = async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
                const url = data.URL;
                (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                const doc = await packagesRef.get();
                if (doc.exists) {
                    console.log(doc.data());
                    const docData = doc.data();
                    console.log(docData);
                    const name = docData === null || docData === void 0 ? void 0 : docData["Name"];
                    console.log(name);
                    const version = docData === null || docData === void 0 ? void 0 : docData["Version"];
                    console.log(version);
                    const id = docData === null || docData === void 0 ? void 0 : docData["ID"];
                    console.log(id);
                    if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
                        const ingestionUrl = db.collection(metadata.Name);
                        await ingestionUrl.doc(metadata.Version).set({
                            Name: metadata.Name,
                            Version: metadata.Version,
                            ID: metadata.ID,
                            URL: url,
                        });
                        res.status(200).send(metadata);
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
};
exports.ingestionURL = ingestionURL;
//# sourceMappingURL=ingestion.js.map