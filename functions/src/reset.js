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
exports.reset = void 0;
var app_1 = require("firebase/app");
var storage_1 = require("firebase/storage");
var firestore_1 = require("firebase-admin/firestore");
var firebase_1 = require("./firebase");
var validate_1 = require("./validate");
var admin = require("firebase-admin");
var reset = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rawHeaders, authHeaderIndex, token, authentication, firebaseApp, storage, db, storageFolder, folderList, folderArray_2, _i, folderArray_1, folder, folderRef, filelist, _a, _b, item, colList, _c, colList_1, col, docs;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                rawHeaders = req.rawHeaders;
                authHeaderIndex = rawHeaders.indexOf("X-Authorization");
                token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
                console.log("token: ".concat(token));
                if (!token) return [3 /*break*/, 17];
                return [4 /*yield*/, (0, validate_1.validation)(token)];
            case 1:
                authentication = _d.sent();
                if (!authentication[0]) return [3 /*break*/, 15];
                firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
                storage = (0, storage_1.getStorage)(firebaseApp);
                console.log("until here");
                db = (0, firestore_1.getFirestore)(admin.apps[0]);
                storageFolder = db.collection("storage");
                return [4 /*yield*/, storageFolder.get()];
            case 2:
                folderList = _d.sent();
                folderArray_2 = [];
                folderList.forEach(function (folder) {
                    folderArray_2.push(folder.id);
                });
                console.log("reset: list of folders ".concat(folderArray_2));
                _i = 0, folderArray_1 = folderArray_2;
                _d.label = 3;
            case 3:
                if (!(_i < folderArray_1.length)) return [3 /*break*/, 9];
                folder = folderArray_1[_i];
                folderRef = (0, storage_1.ref)(storage, "".concat(folder));
                return [4 /*yield*/, (0, storage_1.listAll)(folderRef)];
            case 4:
                filelist = _d.sent();
                _a = 0, _b = filelist.items;
                _d.label = 5;
            case 5:
                if (!(_a < _b.length)) return [3 /*break*/, 8];
                item = _b[_a];
                return [4 /*yield*/, (0, storage_1.deleteObject)((0, storage_1.ref)(storage, item.fullPath))];
            case 6:
                _d.sent();
                _d.label = 7;
            case 7:
                _a++;
                return [3 /*break*/, 5];
            case 8:
                _i++;
                return [3 /*break*/, 3];
            case 9:
                console.log("reset: deleted all from the storage");
                return [4 /*yield*/, db.listCollections()];
            case 10:
                colList = _d.sent();
                console.log("reset: list of collections ".concat(colList));
                _c = 0, colList_1 = colList;
                _d.label = 11;
            case 11:
                if (!(_c < colList_1.length)) return [3 /*break*/, 14];
                col = colList_1[_c];
                if (!(col.id != "Default Admin")) return [3 /*break*/, 13];
                return [4 /*yield*/, col.get()];
            case 12:
                docs = _d.sent();
                docs.forEach(function (doc) {
                    doc.ref["delete"]();
                });
                _d.label = 13;
            case 13:
                _c++;
                return [3 /*break*/, 11];
            case 14:
                console.log("reset: deleted all from the firestore");
                // default admin
                /* const firebaseToken = await admin.auth().createCustomToken("Daniel Doh");
                const idToken = "Bearer " + firebaseToken;
                const users = db.collection("Default Admin");
                await users.doc(idToken).set({
                  Username: "ece30861defaultadminuser",
                  Password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
                  IdToken: idToken,
                  Admin: "true",
                }); */
                console.log("reset: created the default admin");
                res.status(200).send("Registry is reset");
                return [3 /*break*/, 16];
            case 15:
                console.log("reset: No permission");
                res.status(401).send("You do not have permission to reset the registry.");
                _d.label = 16;
            case 16: return [3 /*break*/, 18];
            case 17:
                console.log("reset: missing field(s)");
                res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
                _d.label = 18;
            case 18: return [2 /*return*/];
        }
    });
}); };
exports.reset = reset;
