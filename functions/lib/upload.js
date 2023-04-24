"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const storage_1 = require("firebase/storage");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const fetch = require("node-fetch");
const fs = require("fs");
const admin = require("firebase-admin");
/**
 * Downlaod file using URL
 * @param {string} originUrl
 * @param {string} filename
 * @return {string}
 */
async function downloadFile(originUrl, filename) {
    let url = originUrl + "/archive/main.zip";
    console.log(url);
    let response = await fetch(url);
    // check if the request was successful
    if (response.status != 200) {
        url = originUrl + "/archive/master.zip";
        console.log(url);
    }
    response = await fetch(url);
    if (response.status != 200) {
        throw new Error(`Unable to download file. HTTP status: ${response.status}`);
    }
    const buffer = await response.buffer();
    const base64String = buffer.toString("base64");
    fs.writeFileSync(filename, buffer);
    console.log("File downloaded successfully");
    return base64String;
}
const uploadFile = async (req, res) => {
    let token = req.headers["x-authorization"];
    console.log(`upload: ${token}`);
    if (token) {
        token = (token);
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
                let content = "";
                let repoUrl = "undefined";
                if (data.Content) {
                    content = data.Content;
                }
                else if (data.URL) {
                    console.log(data.URL);
                    repoUrl = data.URL;
                    await downloadFile(data.URL, "/tmp/dummy.zip").then((str) => {
                        content = str;
                        console.log(content);
                    });
                    console.log("upload: downloaded file from URL");
                }
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const filename = metadata.ID + ".bin";
                const storageRef = (0, storage_1.ref)(storage, `${metadata.Name}/${filename}`);
                await (0, storage_1.uploadString)(storageRef, content, "base64");
                console.log("upload: uploaded the content(base64)");
                (0, storage_1.updateMetadata)(storageRef, metadata);
                const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                const IdRef = db.collection("ID").doc(metadata.ID);
                const IdDoc = await IdRef.get();
                const doc = await packagesRef.get();
                if (!doc.exists && !IdDoc.exists) {
                    console.log("upload: checked ");
                    const url = await (0, storage_1.getDownloadURL)(storageRef);
                    const newPackage = db.collection(metadata.Name);
                    await newPackage.doc(metadata.Version).set({
                        Name: metadata.Name,
                        Version: metadata.Version,
                        ID: metadata.ID,
                        Download_URL: url,
                        Repository_URL: repoUrl,
                    });
                    console.log("upload: created new metadata under metadata name collection with new version");
                    const storageFolder = db.collection("storage");
                    await storageFolder.doc(metadata.Name).set({
                        Folder: metadata.Name,
                    });
                    console.log("upload: created the storage folder name document");
                    // History
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
                        Action: "CREATE",
                    };
                    const historyRef = db.collection(metadata.Name).doc("history");
                    const historyDoc = await historyRef.get();
                    if (historyDoc.exists) {
                        await newPackage.doc("history").update({
                            history: firestore_1.FieldValue.arrayUnion(history),
                        });
                    }
                    else {
                        await newPackage.doc("history").set({
                            history: [history],
                        });
                    }
                    // ID
                    const newID = db.collection("ID");
                    await newID.doc(metadata.ID).set({
                        Name: metadata.Name,
                        Version: metadata.Version,
                        ID: metadata.ID,
                        Download_URL: url,
                        Repository_URL: repoUrl,
                    });
                    console.log("upload: created the metadata under metadata ID document");
                }
                else {
                    res.status(409).send("Package exists already.");
                }
                const responseInfo = {
                    metadata: {
                        Name: metadata.Name,
                        Version: metadata.Version,
                        ID: metadata.ID,
                    },
                    data: {
                        Content: content,
                    },
                };
                res.status(200).send(responseInfo);
            }
            catch (error) {
                console.error(error);
                res.status(500).send(error);
            }
        }
        else {
            console.log("upload: wrong token");
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("upload: missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set).");
    }
};
exports.uploadFile = uploadFile;
// 424: Package is not uploaded due to the disqualified rating.
//# sourceMappingURL=upload.js.map