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
    console.log(`update: packageID ${packageID}`);
    let token = req.headers["x-authorization"];
    console.log(`update: ${token}`);
    if (token && packageID) {
        token = (token);
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
                const file = data.Content;
                let url = "undefined";
                if (data.URL) {
                    url = data.URL;
                }
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const filename = packageID + ".bin";
                const storageRef = (0, storage_1.ref)(storage, `${metadata.Name}/${filename}`);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                const IdRef = db.collection("ID").doc(packageID);
                const IdDoc = await IdRef.get();
                const doc = await packagesRef.get();
                if (doc.exists && IdDoc.exists) {
                    console.log("update: found packageName and ID documents");
                    const IdDocData = IdDoc.data();
                    const name = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Name"];
                    const version = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Version"];
                    const id = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["ID"];
                    if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
                        console.log("update: all fields matched");
                        await (0, storage_1.uploadString)(storageRef, file, "base64");
                        await IdRef.update({ Repository_URL: url });
                        await packagesRef.update({ Repository_URL: url });
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
                        console.log("update: some fields are not matching");
                        res.status(404).send("Package is not found.");
                    }
                }
                else {
                    console.log("update: packageId is not matching.");
                    res.status(404).send("Package is not found.");
                }
            }
            catch (error) {
                console.error(error);
                res.status(404).send("Package is not found.");
            }
        }
        else {
            console.log("update: Wrong token");
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("update: Missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
};
exports.updateFile = updateFile;
//# sourceMappingURL=update.js.map