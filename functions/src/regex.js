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
exports.search = void 0;
var firestore_1 = require("firebase-admin/firestore");
var validate_1 = require("./validate");
var admin = require("firebase-admin");
var search = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawHeaders, authHeaderIndex, token, authentication, regEx, regexObj_1, db, packagesListRef, docs, nameArray_1, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("regex: body ".concat(JSON.stringify(req.body)));
                rawHeaders = req.rawHeaders;
                authHeaderIndex = rawHeaders.indexOf("X-Authorization");
                token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
                console.log("regex: ".concat(token));
                if (!token) return [3 /*break*/, 8];
                return [4 /*yield*/, (0, validate_1.validation)(token)];
            case 1:
                authentication = _a.sent();
                if (!authentication[0]) return [3 /*break*/, 6];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                regEx = req.body.RegEx;
                regexObj_1 = new RegExp(regEx);
                db = (0, firestore_1.getFirestore)(admin.apps[0]);
                packagesListRef = db.collection("storage");
                return [4 /*yield*/, packagesListRef.get()];
            case 3:
                docs = _a.sent();
                nameArray_1 = [];
                docs.forEach(function (doc) {
                    var docData = doc.data();
                    var packageName = docData["Folder"];
                    var packageVersion = docData["Version"];
                    var found = regexObj_1.test(packageName);
                    if (found) {
                        var packageInfo = {
                            Version: packageVersion,
                            Name: packageName
                        };
                        nameArray_1.push(packageInfo);
                    }
                });
                if (nameArray_1.length == 0) {
                    console.log("regex: no package found under this regex.");
                    res.status(404).send("No package found under this regex.");
                }
                res.status(200).send(nameArray_1);
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.log(err_1);
                res.status(404).send("No package found under this regex.");
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 7];
            case 6:
                console.log("regex: wrong token");
                res.status(400).send("The AuthenticationToken is invalid.");
                _a.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                console.log("regex: missing field(s)");
                res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
                _a.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.search = search;
