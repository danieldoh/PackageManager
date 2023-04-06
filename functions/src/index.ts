const upload = require("./upload");
const auth = require("./auth");
const update = require("./update");

// this is for github actions testing
exports.auth = auth.auth;
console.log("authentication is completed");
exports.upload = upload.uploadFile;
console.log("upload is completed");
exports.update = update.updateFile;