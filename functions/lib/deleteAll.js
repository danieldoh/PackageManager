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
    console.log(`DeleteAll: packageName ${packageName}`);
    const rawHeaders = req.rawHeaders;
    const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
    const token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
    // console.log(`DeleteAll: ${token}`);
    if (token && packageName) {
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
                console.log("DeleteAll: deleted from storage");
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const packagesRef = db.collection(packageName);
                const docs = await packagesRef.get();
                const idArray = [];
                docs.forEach((doc) => {
                    const docData = doc.data();
                    if (docData["ID"] != undefined) {
                        idArray.push(docData["ID"]);
                    }
                    doc.ref.delete();
                });
                console.log("DeleteAll: deleted from firestore");
                // console.log(idArray);
                for (const id of idArray) {
                    const tempIdRef = db.collection("ID").doc(id);
                    await tempIdRef.delete();
                }
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
            console.log("DeleteAll: Wrong authentication token");
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("DeleteAll: Missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
};
exports.deleteAll = deleteAll;
//# sourceMappingURL=deleteAll.js.map