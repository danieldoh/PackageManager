import * as functions from "firebase-functions";
import express from "express";
import {uploadFile} from "./upload";
import {fileDelete} from "./delete";
import {updateFile} from "./update";
import {downloadFile} from "./download";
import {auth} from "./auth";
import {history} from "./history";
import {deleteAll} from "./deleteAll";
import {reset} from "./reset";

const api = express();

// api.post("/packages", downloadFile); // package"s", get the packages
api.delete("/package/reset", reset); // Reset the registry
api.get("/package/:packageID", downloadFile); // return this package
api.put("/package/:packageID", updateFile); // update the following package ID
api.delete("/package/:packageID", fileDelete);
api.post("/package", uploadFile); // package, upload
// api.get("/package/:packageID/rate", rate);
api.put("/authenticate", auth);
api.get("/package/byName/:packageName", history);
api.delete("/package/byName/:packageName", deleteAll);
// api.post("/package/byRegEx", search);

exports.api = functions.https.onRequest(api);

// delete the ID collection, too -> maybe we should put ID inside the package collection

// fix the validation -> should be able to do it from "default user"
