import * as functions from "firebase-functions";
import express from "express";
// import {Request, Response, NextFunction} from "express";
import {uploadFile} from "./upload";
import {fileDelete} from "./delete";
import {updateFile} from "./update";
import {downloadID} from "./download";
import {auth} from "./auth";
import {history} from "./history";
import {deleteAll} from "./deleteAll";
import {reset} from "./reset";
import {search} from "./regex";
import {downloadVersion} from "./version";
import {rate} from "./rate";
// import path from 'path';
// const fs = require("fs");
const morgan = require("morgan");

const api = express();

api.use(morgan("combined"));

api.post("/packages", downloadVersion); // package"s", get the packages
api.delete("/reset", reset); // Reset the registry
api.get("/package/:packageID", downloadID); // return this package
api.put("/package/:packageID", updateFile); // update the following package ID
api.delete("/package/:packageID", fileDelete);
api.post("/package", uploadFile); // package, upload
api.get("/package/:packageID/rate", rate);
api.put("/authenticate", auth);
api.get("/package/byName/:packageName", history);
api.delete("/package/byName/:packageName", deleteAll);
api.post("/package/byRegEx", search);

exports.api = functions.https.onRequest(api);
