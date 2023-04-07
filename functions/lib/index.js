"use strict";
const upload = require("./upload");
const auth = require("./auth");
const update = require("./update");
const ingestion = require("./ingestion");
// this is for github actions testing
exports.auth = auth.auth;
console.log("authentication function is ready");
exports.upload = upload.uploadFile;
console.log("upload function is ready");
exports.update = update.updateFile;
console.log("update function is ready");
exports.ingestion = ingestion.ingestionURL;
//# sourceMappingURL=index.js.map