"use strict";
exports.__esModule = true;
var functions = require("firebase-functions");
var express_1 = require("express");
// import {Request, Response, NextFunction} from "express";
var upload_1 = require("./upload");
var delete_1 = require("./delete");
var update_1 = require("./update");
var download_1 = require("./download");
var auth_1 = require("./auth");
var history_1 = require("./history");
var deleteAll_1 = require("./deleteAll");
var reset_1 = require("./reset");
var regex_1 = require("./regex");
var version_1 = require("./version");
var rate_1 = require("./rate");
// import path from 'path';
// const fs = require("fs");
var morgan = require("morgan");
var api = (0, express_1["default"])();
api.use(morgan("combined"));
api.post("/packages", version_1.downloadVersion); // package"s", get the packages
api["delete"]("/reset", reset_1.reset); // Reset the registry
api.get("/package/:packageID", download_1.downloadID); // return this package
api.put("/package/:packageID", update_1.updateFile); // update the following package ID
api["delete"]("/package/:packageID", delete_1.fileDelete);
api.post("/package", upload_1.uploadFile); // package, upload
api.get("/package/:packageID/rate", rate_1.rate);
api.put("/authenticate", auth_1.auth);
api.get("/package/byName/:packageName", history_1.history);
api["delete"]("/package/byName/:packageName", deleteAll_1.deleteAll);
api.post("/package/byRegEx", regex_1.search);
exports.api = functions.https.onRequest(api);
