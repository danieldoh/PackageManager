"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFile = void 0;
const storage_1 = require("firebase/storage");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const admin = require("firebase-admin");
const validate_1 = require("./validate");
const updateFile = async (req, res) => {
    const packageID = req.params["packageID"];
    let token = req.headers["x-authorization"];
    if (token && packageID) {
        token = (token);
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
                const file = data.Content;
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const filename = packageID + ".bin";
                const storageRef = (0, storage_1.ref)(storage, `${metadata.Name}/${filename}`);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                const doc = await packagesRef.get();
                if (doc.exists) {
                    const docData = doc.data();
                    const name = docData === null || docData === void 0 ? void 0 : docData["Name"];
                    const version = docData === null || docData === void 0 ? void 0 : docData["Version"];
                    const id = docData === null || docData === void 0 ? void 0 : docData["ID"];
                    if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
                        await (0, storage_1.uploadString)(storageRef, file, "base64");
                        console.log("Updated the file");
                        const pacakgeHistoryRef = db.collection(metadata.Name);
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
                            Action: "UPDATE",
                        };
                        const historyRef = db.collection(metadata.Name).doc("history");
                        const historyDoc = await historyRef.get();
                        if (historyDoc.exists) {
                            await pacakgeHistoryRef.doc("history").update({
                                history: firestore_1.FieldValue.arrayUnion(history),
                            });
                        }
                        else {
                            await pacakgeHistoryRef.doc("history").set({
                                history: [history],
                            });
                        }
                        await (0, storage_1.updateMetadata)(storageRef, metadata);
                        res.status(200).send("Updated the package");
                    }
                    else {
                        res.status(404).send("Package is not found.");
                    }
                }
            }
            catch (error) {
                console.error(error);
                res.status(404).send("Package is not found.");
            }
        }
        else {
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.");
    }
};
exports.updateFile = updateFile;
//# sourceMappingURL=update.js.map