"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.updateFile = void 0;
var storage_1 = require("firebase/storage");
var app_1 = require("firebase/app");
var firestore_1 = require("firebase-admin/firestore");
var firebase_1 = require("./firebase");
var validate_1 = require("./validate");
var crypto = require("crypto");
var path = require("path");
var AdmZip = require("adm-zip");
var fetch = require("node-fetch");
var fs = require("fs");
var admin = require("firebase-admin");
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
function getMetadata(decodeBuf, tempID) {
    return __awaiter(this, void 0, void 0, function () {
        var zipFilePath, extractPath, zip, files, validPath, index, newFilePath, oldFilePath, packageJsonPath, packageJsonContent, packageJson, name, version, id, repository, packageInfo;
        return __generator(this, function (_a) {
            zipFilePath = "/".concat(firebase_1.firebaseConfig.tmp_folder, "/").concat(tempID, "/").concat(firebase_1.firebaseConfig.tmp_folder, ".zip");
            extractPath = "/".concat(firebase_1.firebaseConfig.tmp_folder, "/").concat(tempID, "/extracted");
            // console.log(extractPath);
            fs.mkdirSync(path.dirname(zipFilePath), { recursive: true });
            // console.log("Zip path created to:", path.dirname(zipFilePath));
            // Write the buffer to the zip file
            fs.writeFileSync(zipFilePath, decodeBuf);
            // console.log("Zip file saved to:", zipFilePath);
            // Create the directory where the extracted files will be stored
            fs.mkdirSync(extractPath, { recursive: true });
            zip = new AdmZip(zipFilePath);
            zip.extractAllTo(extractPath, true);
            files = fs.readdirSync(extractPath);
            validPath = extractPath;
            if (!files.includes("package.json")) {
                index = files.indexOf("__MACOSX");
                if (index !== -1) {
                    files.splice(index, 1);
                }
                newFilePath = "/".concat(firebase_1.firebaseConfig.tmp_folder, "/").concat(tempID, "/extracted/package");
                oldFilePath = "/".concat(firebase_1.firebaseConfig.tmp_folder, "/").concat(tempID, "/extracted/").concat(files[0]);
                fs.renameSync(oldFilePath, newFilePath);
                validPath = newFilePath;
            }
            packageJsonPath = path.join(validPath, "package.json");
            packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
            packageJson = JSON.parse(packageJsonContent);
            name = packageJson.name, version = packageJson.version, id = packageJson.id, repository = packageJson.repository;
            if (id == undefined) {
                id = tempID;
            }
            packageInfo = { name: name, version: version, id: id, repository: repository };
            console.log("Package information:", packageInfo);
            return [2 /*return*/, [packageInfo, packageJson]];
        });
    });
}
/**
 * Downlaod file using URL
 * @param {string} originUrl
 * @param {string} filename
 * @return {string}
 */
function downloadFile(originUrl, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, buffer, base64String;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = originUrl + "/archive/main.zip";
                    console.log(url);
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    // check if the request was successful
                    if (response.status != 200) {
                        url = originUrl + "/archive/master.zip";
                        console.log(url);
                    }
                    return [4 /*yield*/, fetch(url)];
                case 2:
                    response = _a.sent();
                    if (response.status != 200) {
                        throw new Error("Unable to download file. HTTP status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.buffer()];
                case 3:
                    buffer = _a.sent();
                    base64String = buffer.toString("base64");
                    fs.writeFileSync(filename, buffer);
                    console.log("File downloaded successfully");
                    return [2 /*return*/, base64String];
            }
        });
    });
}
var updateFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var packageID, rawHeaders, authHeaderIndex, token, authentication, _a, data, metadata, firebaseApp, storage, db, filename, storageRef, packagesRef, IdRef, IdDoc, doc, IdDocData, name_1, version, id, content_1, repoUrl, tempID, decodebuf, contentResult, metadataRepo, tempUrl, pacakgeHistoryRef, timeDate, history_1, historyRef, historyDoc, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Update: body ".concat(JSON.stringify(req.body)));
                packageID = req.params["packageID"];
                console.log("update: packageID ".concat(packageID));
                rawHeaders = req.rawHeaders;
                authHeaderIndex = rawHeaders.indexOf("X-Authorization");
                token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
                if (!(token && packageID)) return [3 /*break*/, 28];
                return [4 /*yield*/, (0, validate_1.validation)(token)];
            case 1:
                authentication = _b.sent();
                if (!authentication[0]) return [3 /*break*/, 26];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 24, , 25]);
                _a = JSON.parse(JSON.stringify(req.body)), data = _a.data, metadata = _a.metadata;
                firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                storage = (0, storage_1.getStorage)(firebaseApp);
                db = (0, firestore_1.getFirestore)(admin.apps[0]);
                filename = packageID + ".bin";
                storageRef = (0, storage_1.ref)(storage, "".concat(metadata.Name, "/").concat(filename));
                packagesRef = db.collection(metadata.Name).doc(metadata.Version);
                IdRef = db.collection("ID").doc(packageID);
                return [4 /*yield*/, IdRef.get()];
            case 3:
                IdDoc = _b.sent();
                return [4 /*yield*/, packagesRef.get()];
            case 4:
                doc = _b.sent();
                if (!(doc.exists && IdDoc.exists)) return [3 /*break*/, 22];
                console.log("update: found packageName and ID documents");
                IdDocData = IdDoc.data();
                name_1 = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Name"];
                version = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Version"];
                id = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["ID"];
                if (!(name_1 == metadata.Name && version == metadata.Version && id == metadata.ID)) return [3 /*break*/, 20];
                console.log("update: all fields matched");
                content_1 = "";
                repoUrl = "undefined";
                if (!(data.Content && data.URL)) return [3 /*break*/, 5];
                res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                return [3 /*break*/, 9];
            case 5:
                if (!data.Content) return [3 /*break*/, 6];
                content_1 = data.Content;
                return [3 /*break*/, 9];
            case 6:
                if (!data.URL) return [3 /*break*/, 8];
                console.log(URL);
                repoUrl = URL;
                return [4 /*yield*/, downloadFile(data.URL, "/tmp/dummy.zip").then(function (str) {
                        content_1 = str;
                    })];
            case 7:
                _b.sent();
                console.log("upload: downloaded file from URL");
                return [3 /*break*/, 9];
            case 8:
                if (data.Content == null && data.URL == null) {
                    res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                }
                _b.label = 9;
            case 9:
                tempID = getID(4);
                decodebuf = Buffer.from(content_1, "base64");
                return [4 /*yield*/, getMetadata(decodebuf, tempID)];
            case 10:
                contentResult = _b.sent();
                metadataRepo = contentResult[0];
                if (metadataRepo["repository"] != undefined) {
                    if ("url" in metadataRepo["repository"]) {
                        tempUrl = metadataRepo["repository"].url;
                        if (typeof tempUrl == "string") {
                            repoUrl = tempUrl.replace(".git", "");
                        }
                    }
                }
                return [4 /*yield*/, (0, storage_1.uploadString)(storageRef, content_1, "base64")];
            case 11:
                _b.sent();
                return [4 /*yield*/, IdRef.update({ Repository_URL: repoUrl })];
            case 12:
                _b.sent();
                return [4 /*yield*/, packagesRef.update({ Repository_URL: repoUrl })];
            case 13:
                _b.sent();
                console.log("Updated the file");
                pacakgeHistoryRef = db.collection(metadata.Name);
                timeDate = new Date().toLocaleString();
                history_1 = {
                    User: {
                        name: authentication[1],
                        isAdmin: authentication[0]
                    },
                    Date: timeDate,
                    PackageMetadata: {
                        Name: metadata.Name,
                        Version: metadata.Version,
                        Id: metadata.ID
                    },
                    Action: "UPDATE"
                };
                historyRef = db.collection(metadata.Name).doc("history");
                return [4 /*yield*/, historyRef.get()];
            case 14:
                historyDoc = _b.sent();
                if (!historyDoc.exists) return [3 /*break*/, 16];
                return [4 /*yield*/, pacakgeHistoryRef.doc("history").update({
                        history: firestore_1.FieldValue.arrayUnion(history_1)
                    })];
            case 15:
                _b.sent();
                return [3 /*break*/, 18];
            case 16: return [4 /*yield*/, pacakgeHistoryRef.doc("history").set({
                    history: [history_1]
                })];
            case 17:
                _b.sent();
                _b.label = 18;
            case 18: return [4 /*yield*/, (0, storage_1.updateMetadata)(storageRef, metadata)];
            case 19:
                _b.sent();
                res.status(200).send("Version is updated.");
                return [3 /*break*/, 21];
            case 20:
                console.log("update: some fields are not matching");
                res.status(404).send("Package is not found.");
                _b.label = 21;
            case 21: return [3 /*break*/, 23];
            case 22:
                console.log("update: packageId is not matching.");
                res.status(404).send("Package is not found.");
                _b.label = 23;
            case 23: return [3 /*break*/, 25];
            case 24:
                error_1 = _b.sent();
                console.error(error_1);
                res.status(404).send("Package is not found.");
                return [3 /*break*/, 25];
            case 25: return [3 /*break*/, 27];
            case 26:
                console.log("update: Wrong token");
                res.status(400).send("The AuthenticationToken is invalid.");
                _b.label = 27;
            case 27: return [3 /*break*/, 29];
            case 28:
                console.log("update: Missing field(s)");
                res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
                _b.label = 29;
            case 29: return [2 /*return*/];
        }
    });
}); };
exports.updateFile = updateFile;
