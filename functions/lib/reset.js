"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reset = void 0;
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const reset = async (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                // delete all folders in firebase storage
                const storage = (0, storage_1.getStorage)(firebaseApp);
                console.log("until here");
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const storageFolder = db.collection("storage");
                const folderList = await storageFolder.get();
                const folderArray = [];
                folderList.forEach((folder) => {
                    folderArray.push(folder.id);
                });
                for (const folder of folderArray) {
                    const folderRef = (0, storage_1.ref)(storage, `${folder}`);
                    const filelist = await (0, storage_1.listAll)(folderRef);
                    for (const item of filelist.items) {
                        await (0, storage_1.deleteObject)((0, storage_1.ref)(storage, item.fullPath));
                    }
                }
                const colList = await db.listCollections();
                for (const col of colList) {
                    const docs = await col.get();
                    docs.forEach((doc) => {
                        doc.ref.delete();
                    });
                }
                // default admin
                const firebaseToken = await admin.auth().createCustomToken("Daniel Doh");
                const idToken = "Bearer " + firebaseToken;
                const users = db.collection("Default Admin");
                await users.doc(idToken).set({
                    Username: "Daniel Doh",
                    Password: "helloworld",
                    IdToken: idToken,
                    Admin: "true",
                });
                res.status(200).send("Registry is reset");
            }
            catch (err) {
                console.log(err);
                res.status(404).send("Package does not exist.");
            }
        }
        else {
            res.status(401).send("You do not have permission to reset the registry.");
        }
    }
    else {
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
};
exports.reset = reset;
//# sourceMappingURL=reset.js.map