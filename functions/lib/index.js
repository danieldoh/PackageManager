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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const upload_1 = require("./upload");
const delete_1 = require("./delete");
const update_1 = require("./update");
const download_1 = require("./download");
const auth_1 = require("./auth");
const history_1 = require("./history");
const deleteAll_1 = require("./deleteAll");
const reset_1 = require("./reset");
const regex_1 = require("./regex");
const api = (0, express_1.default)();
// api.post("/packages", downloadFile); // package"s", get the packages
api.delete("/package/reset", reset_1.reset); // Reset the registry
api.get("/package/:packageID", download_1.downloadID); // return this package
api.put("/package/:packageID", update_1.updateFile); // update the following package ID
api.delete("/package/:packageID", delete_1.fileDelete);
api.post("/package", upload_1.uploadFile); // package, upload
// api.get("/package/:packageID/rate", rate);
api.put("/authenticate", auth_1.auth);
api.get("/package/byName/:packageName", history_1.history);
api.delete("/package/byName/:packageName", deleteAll_1.deleteAll);
api.post("/package/byRegEx", regex_1.search);
exports.api = functions.https.onRequest(api);
// delete the ID collection, too -> maybe we should put ID inside the package collection
//# sourceMappingURL=index.js.map