"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadVersion = void 0;
const firestore_1 = require("firebase-admin/firestore");
const validate_1 = require("./validate");
const semver = __importStar(require("semver"));
const admin = require("firebase-admin");
/**
 * run semver and check version pinning
 * @param {string[]} versionArray
 * @param {string} versionRange
 * @return {string[]}
 */
function getVersionInRange(versionArray, versionRange) {
    return versionArray.filter((version) => semver.satisfies(version, versionRange));
}
const downloadVersion = async (req, res) => {
    console.log(`version(request body): ${req.body}`);
    console.log(`version(request headers): ${req.headers}`);
    let token = req.headers["x-authorization"];
    console.log(`version: ${token}`);
    if (token) {
        token = (token);
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const responseInfo = [];
                await Promise.all(req.body.map(async (obj) => {
                    console.log(`${obj}`);
                    const version = obj.Version;
                    const name = obj.Name;
                    const nameRef = db.collection(name);
                    const versionArray = [];
                    const versions = await nameRef.get();
                    versions.forEach((version) => {
                        if (version.id != "history") {
                            versionArray.push(version.id);
                        }
                    });
                    console.log(`version: ${versionArray}`);
                    const versionPinning = getVersionInRange(versionArray, version);
                    console.log(`version: ${versionPinning} met condition`);
                    if (versionPinning.length != 0) {
                        const arrLen = versionPinning.length;
                        const versionRef = db.collection(name).doc(versionPinning[arrLen - 1]);
                        const versionDoc = await versionRef.get();
                        const versionData = versionDoc.data();
                        const id = versionData === null || versionData === void 0 ? void 0 : versionData["ID"];
                        const oneResponse = {
                            Version: versionPinning[arrLen - 1],
                            Name: name,
                            ID: id,
                        };
                        responseInfo.push(oneResponse);
                    }
                    console.log(`version: finished ${version}, ${name}`);
                    console.log(`version: final ${responseInfo}`);
                }));
                console.log(`version: ${responseInfo}`);
                res.status(200).send(responseInfo);
            }
            catch (err) {
                console.error(err);
                res.status(500).send(err);
            }
        }
        else {
            console.log("version: Wrong authentication token");
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("version: Missing field(s)");
        res.status(404).send("There is missing field(s) in the PackageQuery/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
};
exports.downloadVersion = downloadVersion;
//# sourceMappingURL=version.js.map