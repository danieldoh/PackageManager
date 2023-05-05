"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = void 0;
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const deleteAll = async (req, res) => {
    const packageName = req.params["packageName"];
    let token = req.headers["x-authorization"];
    if (token && packageName) {
        token = (token);
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const storageRef = (0, storage_1.ref)(storage, `${packageName}`);
                const fileList = await (0, storage_1.listAll)(storageRef);
                for (const item of fileList.items) {
                    await (0, storage_1.deleteObject)((0, storage_1.ref)(storage, item.fullPath));
                }
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const packagesRef = db.collection(packageName);
                const docs = await packagesRef.get();
                docs.forEach((doc) => {
                    doc.ref.delete();
                });
                const storageFolder = db.collection("storage").doc(packageName);
                await storageFolder.delete();
                res.status(200).send("Package is deleted");
            }
            catch (err) {
                console.log(err);
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
exports.deleteAll = deleteAll;
//# sourceMappingURL=deleteAll.js.map