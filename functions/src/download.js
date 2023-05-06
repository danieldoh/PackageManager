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
exports.downloadID = void 0;
var firestore_1 = require("firebase-admin/firestore");
var validate_1 = require("./validate");
var fetch = require("node-fetch");
var fs = require("fs");
var admin = require("firebase-admin");
/**
 * Downlaod file using URL
 * @param {string} url
 * @param {string} filename
 * @return {string}
 */
function downloadURL(url, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var response, buffer, base64String;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    if (response.status != 200) {
                        throw new Error("Unable to download file. HTTP status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.buffer()];
                case 2:
                    buffer = _a.sent();
                    base64String = buffer.toString("base64");
                    fs.writeFileSync(filename, buffer);
                    console.log("downlaod: File downloaded successfully");
                    return [2 /*return*/, base64String];
            }
        });
    });
}
var downloadID = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var packageID, rawHeaders, authHeaderIndex, token, authentication, db, idRef, idInfo, idData, packageName, packageVersion, url, repoUrl, content_1, info, info, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                packageID = req.params["packageID"];
                console.log("download: packageId ".concat(packageID));
                rawHeaders = req.rawHeaders;
                authHeaderIndex = rawHeaders.indexOf("X-Authorization");
                token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
                if (!token) return [3 /*break*/, 11];
                return [4 /*yield*/, (0, validate_1.validation)(token)];
            case 1:
                authentication = _a.sent();
                if (!authentication[0]) return [3 /*break*/, 9];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                db = (0, firestore_1.getFirestore)(admin.apps[0]);
                idRef = db.collection("ID").doc(packageID);
                return [4 /*yield*/, idRef.get()];
            case 3:
                idInfo = _a.sent();
                if (!idInfo.exists) return [3 /*break*/, 5];
                console.log("download: found the package");
                idData = idInfo.data();
                packageName = idData === null || idData === void 0 ? void 0 : idData["Name"];
                packageVersion = idData === null || idData === void 0 ? void 0 : idData["Version"];
                url = idData === null || idData === void 0 ? void 0 : idData["Download_URL"];
                repoUrl = idData === null || idData === void 0 ? void 0 : idData["Repository_URL"];
                content_1 = "";
                return [4 /*yield*/, downloadURL(url, "/tmp/dummy.zip").then(function (str) {
                        content_1 = str;
                        // console.log(content);
                    })];
            case 4:
                _a.sent();
                console.log("download: downloaded");
                if (repoUrl == "undefined") {
                    info = {
                        metadata: {
                            Name: packageName,
                            Version: packageVersion,
                            ID: packageID
                        },
                        data: {
                            Content: content_1
                        }
                    };
                    res.status(200).send(info);
                }
                else if (repoUrl != "undefined") {
                    info = {
                        metadata: {
                            Name: packageName,
                            Version: packageVersion,
                            ID: packageID
                        },
                        data: {
                            Content: content_1,
                            URL: repoUrl
                        }
                    };
                    res.status(200).send(info);
                }
                return [3 /*break*/, 6];
            case 5:
                res.status(404).send("Package does not exist.");
                _a.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).send(err_1);
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                console.log("download: wrong token");
                res.status(401).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
                _a.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                console.log("download: missing field(s)");
                res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.downloadID = downloadID;
