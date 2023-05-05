"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFile = void 0;
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
 * @return {[metadataJson, object]}
 */
async function getMetadata(decodeBuf, tempID) {
    const zipFilePath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/${firebase_1.firebaseConfig.tmp_folder}.zip`;
    // console.log(zipFilePath);
    const extractPath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/extracted`;
    // console.log(extractPath);
    fs.mkdirSync(path.dirname(zipFilePath), { recursive: true });
    // console.log("Zip path created to:", path.dirname(zipFilePath));
    // Write the buffer to the zip file
    fs.writeFileSync(zipFilePath, decodeBuf);
    // console.log("Zip file saved to:", zipFilePath);
    // Create the directory where the extracted files will be stored
    fs.mkdirSync(extractPath, { recursive: true });
    // console.log("Extract path created:", extractPath);
    // Use adm-zip to extract the contents of the zip file
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractPath, true);
    // console.log("Zip file extracted to:", extractPath);
    // Use fs.readdir() to get a list of files in extractPath
    const files = fs.readdirSync(extractPath);
    // console.log("List of files in extractPath:", files);
    let validPath = extractPath;
    if (!files.includes("package.json")) {
        const index = files.indexOf("__MACOSX");
        if (index !== -1) {
            files.splice(index, 1);
        }
        const newFilePath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/extracted/package`;
        const oldFilePath = `/${firebase_1.firebaseConfig.tmp_folder}/${tempID}/extracted/${files[0]}`;
        fs.renameSync(oldFilePath, newFilePath);
        validPath = newFilePath;
    }
    // console.log(`upload: validpath ${validPath}`);
    // Read the package.json file and extract the name and version fields
    const packageJsonPath = path.join(validPath, "package.json");
    // console.log("Reading package.json file:", packageJsonPath);
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    // console.log(packageJson);
    let { name, version, id, repository } = packageJson;
    if (id == undefined) {
        id = tempID;
    }
    // Log the package information
    const packageInfo = { name, version, id, repository };
    console.log("Package information:", packageInfo);
    return [packageInfo, packageJson];
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
const updateFile = async (req, res) => {
    console.log(`Update: body ${JSON.stringify(req.body)}`);
    const packageID = req.params["packageID"];
    console.log(`update: packageID ${packageID}`);
    const rawHeaders = req.rawHeaders;
    const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
    const token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
    // console.log(`update: ${token}`);
    if (token && packageID) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const { data, metadata } = JSON.parse(JSON.stringify(req.body));
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
                        let content = "";
                        let repoUrl = "undefined";
                        if (data.Content && data.URL) {
                            res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                        }
                        else if (data.Content) {
                            content = data.Content;
                        }
                        else if (data.URL) {
                            console.log(URL);
                            repoUrl = URL;
                            await downloadFile(data.URL, "/tmp/dummy.zip").then((str) => {
                                content = str;
                            });
                            console.log("upload: downloaded file from URL");
                        }
                        else if (data.Content == null && data.URL == null) {
                            res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                        }
                        const tempID = getID(4);
                        // console.log(`Upload: ID ${tempID}`);
                        const decodebuf = Buffer.from(content, "base64");
                        const contentResult = await getMetadata(decodebuf, tempID);
                        // const packageJson = contentResult[1];
                        const metadataRepo = contentResult[0];
                        if (metadataRepo["repository"] != undefined) {
                            if ("url" in metadataRepo["repository"]) {
                                const tempUrl = metadataRepo["repository"].url;
                                if (typeof tempUrl == "string") {
                                    repoUrl = tempUrl.replace(".git", "");
                                }
                            }
                        }
                        await (0, storage_1.uploadString)(storageRef, content, "base64");
                        await IdRef.update({ Repository_URL: repoUrl });
                        await packagesRef.update({ Repository_URL: repoUrl });
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
                        res.status(200).send("Version is updated.");
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