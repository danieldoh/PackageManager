"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadID = void 0;
const firestore_1 = require("firebase-admin/firestore");
const validate_1 = require("./validate");
const fetch = require("node-fetch");
const fs = require("fs");
const admin = require("firebase-admin");
/**
 * Downlaod file using URL
 * @param {string} url
 * @param {string} filename
 * @return {string}
 */
async function downloadURL(url, filename) {
    const response = await fetch(url);
    if (response.status != 200) {
        throw new Error(`Unable to download file. HTTP status: ${response.status}`);
    }
    const buffer = await response.buffer();
    const base64String = buffer.toString("base64");
    fs.writeFileSync(filename, buffer);
    console.log("downlaod: File downloaded successfully");
    return base64String;
}
const downloadID = async (req, res) => {
    const packageID = req.params["packageID"];
    console.log(`download: packageId ${packageID}`);
    const rawHeaders = req.rawHeaders;
    const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
    const token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
    // console.log(`download: ${token}`);
    if (token) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const idRef = db.collection("ID").doc(packageID);
                const idInfo = await idRef.get();
                if (idInfo.exists) {
                    console.log("download: found the package");
                    const idData = idInfo.data();
                    // console.log(idData);
                    const packageName = idData === null || idData === void 0 ? void 0 : idData["Name"];
                    const packageVersion = idData === null || idData === void 0 ? void 0 : idData["Version"];
                    const url = idData === null || idData === void 0 ? void 0 : idData["Download_URL"];
                    const repoUrl = idData === null || idData === void 0 ? void 0 : idData["Repository_URL"];
                    let content = "";
                    await downloadURL(url, "/tmp/dummy.zip").then((str) => {
                        content = str;
                        // console.log(content);
                    });
                    console.log("download: downloaded");
                    if (repoUrl == "undefined") {
                        const info = {
                            metadata: {
                                Name: packageName,
                                Version: packageVersion,
                                ID: packageID,
                            },
                            data: {
                                Content: content,
                            },
                        };
                        res.status(200).send(info);
                    }
                    else if (repoUrl != "undefined") {
                        const info = {
                            metadata: {
                                Name: packageName,
                                Version: packageVersion,
                                ID: packageID,
                            },
                            data: {
                                Content: content,
                                URL: repoUrl,
                            },
                        };
                        res.status(200).send(info);
                    }
                }
                else {
                    res.status(404).send("Package does not exist.");
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err);
            }
        }
        else {
            console.log("download: wrong token");
            res.status(401).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("download: missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
};
exports.downloadID = downloadID;
//# sourceMappingURL=download.js.map