"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileDelete = void 0;
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const fileDelete = async (req, res) => {
    const packageID = req.params["packageID"];
    console.log(`Delete: packageID ${packageID}`);
    const rawHeaders = req.rawHeaders;
    const authHeaderIndex = rawHeaders.indexOf('X-Authorization');
    const token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
    console.log(`Delete: ${token}`);
    if (token && packageID) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const filename = packageID + ".bin";
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const IdRef = db.collection("ID").doc(packageID);
                const IdDoc = await IdRef.get();
                const IdDocData = IdDoc.data();
                const name = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Name"];
                const version = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Version"];
                const id = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["ID"];
                const storageRef = (0, storage_1.ref)(storage, `${name}/${filename}`);
                await (0, storage_1.deleteObject)(storageRef);
                console.log("delete: deleted from storage");
                const packagesRef = db.collection(name).doc(version);
                await packagesRef.delete();
                console.log("delete: deleted package collection");
                await IdRef.delete();
                console.log("delete: deleted id collection");
                const pacakgeHistoryRef = db.collection(name);
                const timeDate = new Date().toLocaleString();
                const history = {
                    User: {
                        name: authentication[1],
                        isAdmin: authentication[0],
                    },
                    Date: timeDate,
                    PackageMetadata: {
                        Name: name,
                        Version: version,
                        Id: id,
                    },
                    Action: "DELETE",
                };
                const historyRef = db.collection(name).doc("history");
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
                console.log("delete: Package is deleted");
                res.status(200).send("Package is deleted");
            }
            catch (err) {
                console.log(err);
                res.status(404).send("Package does not exist.");
            }
        }
        else {
            console.log("Delete: The AuthenticationToken is invalid. ");
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("Delete: There is missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid");
    }
};
exports.fileDelete = fileDelete;
//# sourceMappingURL=delete.js.map