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
exports.auth = void 0;
var functions = require("firebase-functions");
var admin = require("firebase-admin");
admin.initializeApp();
var cors = require("cors")({ origin: true });
var auth = function (req, res) {
    console.log("Auth: ".concat(JSON.stringify(req.body)));
    var info = req.body;
    // console.log(`${info}`);
    var user = info["User"];
    var secret = info["Secret"];
    var username = user["name"];
    // console.log(username);
    var isAdmin = user["isAdmin"];
    var password = secret["password"];
    try {
        return cors(req, res, function () { return __awaiter(void 0, void 0, void 0, function () {
            var valid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!username) {
                            console.log("Authenticate: no username");
                            return [2 /*return*/, res.status(400).send("There is missing field(s) in the AuthenticationRequest or it is formed improperly.")];
                        }
                        if (!password) {
                            console.log("Authenticate: no password");
                            return [2 /*return*/, res.status(400).json("There is missing field(s) in the AuthenticationRequest or it is formed improperly.")];
                        }
                        if (!isAdmin) {
                            console.log("Authenticate: no isAdmin");
                            return [2 /*return*/, res.status(400).json("There is missing field(s) in the AuthenticationRequest or it is formed improperly.")];
                        }
                        if (isAdmin != true && isAdmin != false) {
                            console.log("Authenticate: wrong format of isAdmin");
                            return [2 /*return*/, res.status(400).json("There is missing field(s) in the AuthenticationRequest or it is formed improperly.")];
                        }
                        return [4 /*yield*/, checkUsername(username, password, isAdmin)];
                    case 1:
                        valid = _a.sent();
                        if (!valid[0]) {
                            console.log("The user or password is invalid, Username: ".concat(username, " Password: ").concat(password));
                            return [2 /*return*/, res.status(401).json("The user or password is invalid")];
                        }
                        console.log("Authentication: Token is created");
                        return [2 /*return*/, res.status(200).send(valid[1])];
                }
            });
        }); });
    }
    catch (error) {
        functions.logger.error({ User: username }, error);
        console.error(error);
        return res.status(400).send("There is missing field(s) in the AuthenticationRequest or it is formed improperly.");
    }
};
exports.auth = auth;
var firestore_1 = require("firebase-admin/firestore");
var db = (0, firestore_1.getFirestore)(admin.apps[0]);
/**
 * Generate token for the username and store in the db
 * @param {string} username
 * @param {string} password
 * @param {boolean} Admin
 * @return {[boolean, string]}
 */
function checkUsername(username, password, Admin) {
    return __awaiter(this, void 0, void 0, function () {
        var users, doc, firebaseToken, idtoken, newToken, newUser, users_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    users = db.collection("users").doc(username);
                    return [4 /*yield*/, users.get()];
                case 1:
                    doc = _a.sent();
                    if (!!doc.exists) return [3 /*break*/, 7];
                    return [4 /*yield*/, admin.auth().createCustomToken(username)];
                case 2:
                    firebaseToken = _a.sent();
                    console.log("Token is created");
                    idtoken = "Bearer " + firebaseToken;
                    newToken = db.collection("token");
                    return [4 /*yield*/, newToken.doc(idtoken).set({
                            Username: username,
                            Password: password,
                            IdToken: idtoken,
                            Admin: Admin
                        })];
                case 3:
                    _a.sent();
                    newUser = db.collection("users");
                    return [4 /*yield*/, newUser.doc(username).set({
                            Username: username,
                            Password: password,
                            IdToken: idtoken,
                            Admin: Admin
                        })];
                case 4:
                    _a.sent();
                    if (!(Admin == true)) return [3 /*break*/, 6];
                    users_1 = db.collection("Default Admin");
                    return [4 /*yield*/, users_1.doc(idtoken).set({
                            Username: username,
                            Password: password,
                            IdToken: idtoken,
                            Admin: "true"
                        })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, [true, idtoken]];
                case 7: return [2 /*return*/, [false, "Failed"]];
            }
        });
    });
}
