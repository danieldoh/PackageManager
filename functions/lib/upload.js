"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const storage_1 = require("firebase/storage");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const validate_1 = require("./validate");
const crypto = require("crypto");
const path = require("path");
const AdmZip = require("adm-zip");
const fetch = require("node-fetch");
const fs = require("fs");
const admin = require("firebase-admin");
/* interface rateJson {
  BusFactor: string;
  Correctness: string;
  RampUp: string;
  ResponsiveMaintainer: string;
  LicenseScore: string;
  GoodPinningPractice: string;
  PullRequest: string;
  NetScore: string;
}*/
/**
 * Generate ID
 * @param {number} bytes
 * @return {string}
 */
function getID(bytes) {
    return crypto.randomBytes(bytes).toString("hex");
}
/**
 * Get metadata from package.json
 * @param {Buffer} decodeBuf
 * @param {string} tempID
 * @return {metadataJson}
 */
async function getMetadata(decodeBuf, tempID) {
    const zipFilePath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/${firebase_1.firebaseConfig.tmp_folder}.zip`;
    console.log(zipFilePath);
    const extractPath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/extracted`;
    console.log(extractPath);
    fs.mkdirSync(path.dirname(zipFilePath), { recursive: true });
    console.log("Zip path created to:", path.dirname(zipFilePath));
    // Write the buffer to the zip file
    fs.writeFileSync(zipFilePath, decodeBuf);
    console.log("Zip file saved to:", zipFilePath);
    // Create the directory where the extracted files will be stored
    fs.mkdirSync(extractPath, { recursive: true });
    console.log("Extract path created:", extractPath);
    // Use adm-zip to extract the contents of the zip file
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractPath, true);
    console.log("Zip file extracted to:", extractPath);
    // Use fs.readdir() to get a list of files in extractPath
    const files = fs.readdirSync(extractPath);
    console.log("List of files in extractPath:", files);
    const newFilePath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/extracted/package`;
    const oldFilePath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/extracted/${files[0]}`;
    fs.renameSync(oldFilePath, newFilePath);
    // Read the package.json file and extract the name and version fields
    const packageJsonPath = path.join(newFilePath, "package.json");
    console.log("Reading package.json file:", packageJsonPath);
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    console.log(packageJson);
    let { name, version, id } = packageJson;
    if (id == undefined) {
        id = tempID;
    }
    // Log the package information
    const packageInfo = { name, version, id };
    console.log("Package information:", packageInfo);
    return packageInfo;
}
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
    console.log(`upload(request body): ${req.body}`);
    console.log(`upload(request headers): ${req.headers}`);
    let token = req.headers["x-authorization"];
    console.log(`upload: ${token}`);
    if (token) {
        token = (token);
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { Content, URL } = JSON.parse(JSON.stringify(req.body));
                let content = "";
                let repoUrl = "undefined";
                if (Content) {
                    content = Content;
                }
                else if (URL) {
                    console.log(URL);
                    repoUrl = URL;
                    await downloadFile(URL, "/tmp/dummy.zip").then((str) => {
                        content = str;
                        console.log(content);
                    });
                    console.log("upload: downloaded file from URL");
                }
                const tempID = getID(4);
                console.log(`Upload: ID ${tempID}`);
                const decodebuf = Buffer.from(content, "base64");
                const metadata = await getMetadata(decodebuf, tempID);
                const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                const storage = (0, storage_1.getStorage)(firebaseApp);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const filename = metadata["id"] + ".bin";
                const storageRef = (0, storage_1.ref)(storage, `${metadata["name"]}/${filename}`);
                await (0, storage_1.uploadString)(storageRef, content, "base64");
                console.log("upload: uploaded the content(base64)");
                const packagesRef = db.collection(metadata["name"]).doc(metadata["version"]);
                const IdRef = db.collection("ID").doc(metadata["id"]);
                const IdDoc = await IdRef.get();
                const doc = await packagesRef.get();
                if (!doc.exists && !IdDoc.exists) {
                    console.log("upload: checked ");
                    const url = await (0, storage_1.getDownloadURL)(storageRef);
                    const newPackage = db.collection(metadata["name"]);
                    await newPackage.doc(metadata["version"]).set({
                        Name: metadata["name"],
                        Version: metadata["version"],
                        ID: metadata["id"],
                        Download_URL: url,
                        Repository_URL: repoUrl,
                    });
                    console.log("upload: created new metadata under metadata name collection with new version");
                    const storageFolder = db.collection("storage");
                    await storageFolder.doc(metadata["name"]).set({
                        Folder: metadata["name"],
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
                            Name: metadata["name"],
                            Version: metadata["version"],
                            Id: metadata["id"],
                        },
                        Action: "CREATE",
                    };
                    const historyRef = db.collection(metadata["name"]).doc("history");
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
                    const rate = {};
                    if (url != "undefined") {
                        console.log(`upload: rate = ${rate}`);
                    }
                    const newID = db.collection("ID");
                    await newID.doc(metadata["id"]).set({
                        Name: metadata["name"],
                        Version: metadata["version"],
                        ID: metadata["id"],
                        Download_URL: url,
                        Repository_URL: repoUrl,
                        Rate: rate,
                    });
                    console.log("upload: created the metadata under metadata ID document");
                }
                else {
                    res.status(409).send("Package exists already.");
                }
                const responseInfo = {
                    metadata: {
                        Name: metadata["name"],
                        Version: metadata["version"],
                        ID: metadata["id"],
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