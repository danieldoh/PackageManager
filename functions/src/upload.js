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
exports.uploadFile = void 0;
var storage_1 = require("firebase/storage");
var app_1 = require("firebase/app");
var firestore_1 = require("firebase-admin/firestore");
var firebase_1 = require("./firebase");
var validate_1 = require("./validate");
var licAndResp_1 = require("./licAndResp");
var busfactor_1 = require("./busfactor");
var versionPinning_1 = require("./versionPinning");
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
        var errorMeta, zipFilePath, extractPath, zip, files, validPath, index, newFilePath, oldFilePath, packageJsonPath, packageJsonContent, packageJson, name_1, version, id, repository, packageInfo;
        return __generator(this, function (_a) {
            errorMeta = {
                name: "undefined",
                version: "undefined",
                id: "undefined",
                repository: {}
            };
            try {
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
                name_1 = packageJson.name, version = packageJson.version, id = packageJson.id, repository = packageJson.repository;
                if (id == undefined) {
                    id = tempID;
                }
                packageInfo = { name: name_1, version: version, id: id, repository: repository };
                // console.log("Package information:", packageInfo);
                return [2 /*return*/, [packageInfo, packageJson]];
            }
            catch (error) {
                return [2 /*return*/, [errorMeta, {}]];
            }
            return [2 /*return*/];
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
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    // check if the request was successful
                    if (response.status != 200) {
                        url = originUrl + "/archive/master.zip";
                        // console.log(url);
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
var uploadFile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawHeaders, authHeaderIndex, token, authentication, _a, Content, URL_1, content_1, repoUrl, tempID, decodebuf, contentResult, metadata, tempUrl, owner, repo, repoInfo, lastTwoParts, busfactor, license, responsiveness, correctness, rampup, versionPinning, pullrequest, rate, firebaseApp, storage, db, filename, storageRef, packagesRef, IdRef, IdDoc, doc, url, newPackage, storageFolder, timeDate, history_1, historyRef, historyDoc, newID, responseInfo, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("upload(request body): ".concat(JSON.stringify(req.body)));
                rawHeaders = req.rawHeaders;
                console.log("upload: headers ".concat(rawHeaders));
                authHeaderIndex = rawHeaders.indexOf("X-Authorization");
                token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
                console.log("upload: ".concat(token));
                if (!token) return [3 /*break*/, 31];
                return [4 /*yield*/, (0, validate_1.validation)(token)];
            case 1:
                authentication = _b.sent();
                if (!authentication[0]) return [3 /*break*/, 29];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 27, , 28]);
                _a = JSON.parse(JSON.stringify(req.body)), Content = _a.Content, URL_1 = _a.URL;
                content_1 = "";
                repoUrl = "undefined";
                if (!(Content && URL_1)) return [3 /*break*/, 3];
                res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                return [3 /*break*/, 7];
            case 3:
                if (!Content) return [3 /*break*/, 4];
                content_1 = Content;
                return [3 /*break*/, 7];
            case 4:
                if (!URL_1) return [3 /*break*/, 6];
                console.log(URL_1);
                repoUrl = URL_1;
                return [4 /*yield*/, downloadFile(URL_1, "/tmp/dummy.zip").then(function (str) {
                        content_1 = str;
                    })];
            case 5:
                _b.sent();
                return [3 /*break*/, 7];
            case 6:
                if (Content == null && URL_1 == null) {
                    res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                }
                _b.label = 7;
            case 7:
                tempID = getID(4);
                decodebuf = Buffer.from(content_1, "base64");
                return [4 /*yield*/, getMetadata(decodebuf, tempID)];
            case 8:
                contentResult = _b.sent();
                metadata = contentResult[0];
                if (metadata["name"] == "undefined") {
                    res.status(424).send("Package is not uploaded due to the disqualified rating.");
                }
                else if (metadata["repository"] != undefined) {
                    if ("url" in metadata["repository"]) {
                        tempUrl = metadata["repository"].url;
                        if (typeof tempUrl == "string") {
                            repoUrl = tempUrl.replace(".git", "");
                        }
                    }
                }
                if (repoUrl == "undefined") {
                    res.status(424).send("Package is not uploaded due to the disqualified rating.");
                }
                console.log("upload: ".concat(repoUrl));
                owner = "undefined";
                repo = "undefined";
                if (typeof repoUrl == "string") {
                    repoInfo = repoUrl.split("/");
                    lastTwoParts = repoInfo.slice(-2);
                    owner = lastTwoParts[0];
                    console.log(owner);
                    repo = lastTwoParts[1];
                    console.log(repo);
                }
                return [4 /*yield*/, (0, busfactor_1.getBusFactor)(owner, repo)];
            case 9:
                busfactor = _b.sent();
                return [4 /*yield*/, (0, licAndResp_1.getLicense)(owner, repo)];
            case 10:
                license = _b.sent();
                return [4 /*yield*/, (0, licAndResp_1.getResponsiveness)(owner, repo)];
            case 11:
                responsiveness = _b.sent();
                correctness = 1;
                rampup = 1;
                return [4 /*yield*/, (0, versionPinning_1.getVP)(owner, repo)];
            case 12:
                versionPinning = _b.sent();
                pullrequest = 1;
                rate = {
                    "BusFactor": busfactor,
                    "Correctness": correctness,
                    "RampUp": rampup,
                    "ResponsiveMaintainer": responsiveness,
                    "LicenseScore": license,
                    "GoodPinningPractice": versionPinning,
                    "PullRequest": pullrequest,
                    "NetScore": (license * (0.3 * (busfactor + versionPinning) + 0.1 * (correctness + rampup + responsiveness + pullrequest)))
                };
                console.log(rate);
                if (rate.NetScore < 0.5) {
                    res.status(424).send("Package is not uploaded due to the disqualified rating.");
                }
                firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                storage = (0, storage_1.getStorage)(firebaseApp);
                db = (0, firestore_1.getFirestore)(admin.apps[0]);
                filename = metadata["id"] + ".bin";
                storageRef = (0, storage_1.ref)(storage, "".concat(metadata["name"], "/").concat(filename));
                return [4 /*yield*/, (0, storage_1.uploadString)(storageRef, content_1, "base64")];
            case 13:
                _b.sent();
                console.log("upload: uploaded the content(base64)");
                packagesRef = db.collection(metadata["name"]).doc(metadata["version"]);
                IdRef = db.collection("ID").doc(metadata["id"]);
                return [4 /*yield*/, IdRef.get()];
            case 14:
                IdDoc = _b.sent();
                return [4 /*yield*/, packagesRef.get()];
            case 15:
                doc = _b.sent();
                if (!(!doc.exists && !IdDoc.exists)) return [3 /*break*/, 25];
                console.log("upload: checked ");
                return [4 /*yield*/, (0, storage_1.getDownloadURL)(storageRef)];
            case 16:
                url = _b.sent();
                newPackage = db.collection(metadata["name"]);
                return [4 /*yield*/, newPackage.doc(metadata["version"]).set({
                        Name: metadata["name"],
                        Version: metadata["version"],
                        ID: metadata["id"],
                        Download_URL: url,
                        Repository_URL: repoUrl
                    })];
            case 17:
                _b.sent();
                console.log("upload: created new metadata under metadata name collection with new version");
                storageFolder = db.collection("storage");
                return [4 /*yield*/, storageFolder.doc(metadata["name"]).set({
                        Folder: metadata["name"],
                        Version: metadata["version"]
                    })];
            case 18:
                _b.sent();
                console.log("upload: created the storage folder name document");
                timeDate = new Date().toLocaleString();
                history_1 = {
                    User: {
                        name: authentication[1],
                        isAdmin: authentication[0]
                    },
                    Date: timeDate,
                    PackageMetadata: {
                        Name: metadata["name"],
                        Version: metadata["version"],
                        Id: metadata["id"]
                    },
                    Action: "CREATE"
                };
                historyRef = db.collection(metadata["name"]).doc("history");
                return [4 /*yield*/, historyRef.get()];
            case 19:
                historyDoc = _b.sent();
                if (!historyDoc.exists) return [3 /*break*/, 21];
                return [4 /*yield*/, newPackage.doc("history").update({
                        history: firestore_1.FieldValue.arrayUnion(history_1)
                    })];
            case 20:
                _b.sent();
                return [3 /*break*/, 23];
            case 21: return [4 /*yield*/, newPackage.doc("history").set({
                    history: [history_1]
                })];
            case 22:
                _b.sent();
                _b.label = 23;
            case 23:
                // ID
                if (url != "undefined") {
                    console.log("upload: rate = ".concat(rate));
                }
                newID = db.collection("ID");
                return [4 /*yield*/, newID.doc(metadata["id"]).set({
                        Name: metadata["name"],
                        Version: metadata["version"],
                        ID: metadata["id"],
                        Download_URL: url,
                        Repository_URL: repoUrl,
                        Rate: rate
                    })];
            case 24:
                _b.sent();
                console.log("upload: created the metadata under metadata ID document");
                return [3 /*break*/, 26];
            case 25:
                res.status(409).send("Package exists already.");
                _b.label = 26;
            case 26:
                responseInfo = {
                    metadata: {
                        Name: metadata["name"],
                        Version: metadata["version"],
                        ID: metadata["id"]
                    },
                    data: {
                        Content: content_1
                    }
                };
                res.status(201).send(responseInfo);
                return [3 /*break*/, 28];
            case 27:
                error_1 = _b.sent();
                console.error(error_1);
                res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                return [3 /*break*/, 28];
            case 28: return [3 /*break*/, 30];
            case 29:
                console.log("upload: wrong token");
                res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                _b.label = 30;
            case 30: return [3 /*break*/, 32];
            case 31:
                console.log("upload: missing field(s)");
                res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
                _b.label = 32;
            case 32: return [2 /*return*/];
        }
    });
}); };
exports.uploadFile = uploadFile;
