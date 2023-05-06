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
exports.downloadVersion = void 0;
var firestore_1 = require("firebase-admin/firestore");
var validate_1 = require("./validate");
var semver = require("semver");
var admin = require("firebase-admin");
/**
 * run semver and check version pinning
 * @param {string[]} versionArray
 * @param {string} versionRange
 * @return {string[]}
 */
function getVersionInRange(versionArray, versionRange) {
    return versionArray.filter(function (version) { return semver.satisfies(version, versionRange); });
}
var downloadVersion = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawHeaders, authHeaderIndex, token, authentication, db_1, responseInfo_1, count_1, reqInfo_1, storageFolder, folderList, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("version(request body): ".concat(JSON.stringify(req.body)));
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
                db_1 = (0, firestore_1.getFirestore)(admin.apps[0]);
                responseInfo_1 = [];
                count_1 = 0;
                console.log(req.body[0]["Name"]);
                reqInfo_1 = [];
                if (!(req.body[0]["Name"] == "*")) return [3 /*break*/, 4];
                storageFolder = db_1.collection("storage");
                return [4 /*yield*/, storageFolder.get()];
            case 3:
                folderList = _a.sent();
                folderList.forEach(function (folder) {
                    var info = {
                        Version: req.body[0]["Version"],
                        Name: folder.id
                    };
                    console.log(info);
                    console.log(folder.id);
                    reqInfo_1.push(info);
                });
                return [3 /*break*/, 5];
            case 4:
                reqInfo_1 = req.body;
                _a.label = 5;
            case 5: return [4 /*yield*/, Promise.all(req.body.forEach(function (obj) { return __awaiter(void 0, void 0, void 0, function () {
                    var version, name, nameRef, versionArray, versions, versionPinning, arrLen, versionRef, versionDoc, versionData, id, oneResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log("".concat(obj));
                                version = obj.Version;
                                name = obj.Name;
                                console.log(name);
                                nameRef = db_1.collection(name);
                                versionArray = [];
                                return [4 /*yield*/, nameRef.get()];
                            case 1:
                                versions = _a.sent();
                                versions.forEach(function (version) {
                                    if (version.id != "history") {
                                        versionArray.push(version.id);
                                    }
                                });
                                versionPinning = getVersionInRange(versionArray, version);
                                if (!(versionPinning.length != 0)) return [3 /*break*/, 3];
                                arrLen = versionPinning.length;
                                versionRef = db_1.collection(name).doc(versionPinning[arrLen - 1]);
                                return [4 /*yield*/, versionRef.get()];
                            case 2:
                                versionDoc = _a.sent();
                                versionData = versionDoc.data();
                                id = versionData === null || versionData === void 0 ? void 0 : versionData["ID"];
                                oneResponse = {
                                    Version: versionPinning[arrLen - 1],
                                    Name: name,
                                    ID: id
                                };
                                responseInfo_1.push(oneResponse);
                                _a.label = 3;
                            case 3:
                                // console.log(`version: finished ${version}, ${name}`);
                                // console.log(`version: final ${responseInfo}`);
                                count_1 += 1;
                                return [2 /*return*/];
                        }
                    });
                }); }))];
            case 6:
                _a.sent();
                if (responseInfo_1.length > count_1) {
                    res.status(413).send("Too many packages returned.");
                }
                // console.log(`version: ${responseInfo}`);
                res.status(200).send(responseInfo_1);
                return [3 /*break*/, 8];
            case 7:
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).send(err_1);
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                console.log("version: Wrong authentication token");
                res.status(400).send("The AuthenticationToken is invalid.");
                _a.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                console.log("version: Missing field(s)");
                res.status(400).send("There is missing field(s) in the PackageQuery/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.downloadVersion = downloadVersion;
