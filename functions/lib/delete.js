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
    const token = req.headers.authorization;
    if (token && packageID) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { metadata } = JSON.parse(JSON.stringify(req.body));
                console.log(firebase_1.firebaseConfig);
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const filename = packageID + ".bin";
                const storageRef = (0, storage_1.ref)(storage, `${metadata.Name}/${filename}`);
                await (0, storage_1.deleteObject)(storageRef);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                await packagesRef.delete();
                res.status(200).send("Package is deleted");
            }
            catch (err) {
                res.status(404).send("Package does not exist.");
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
exports.fileDelete = fileDelete;
//# sourceMappingURL=delete.js.map