const upload = require("./upload");
const auth = require("./auth");

exports.auth = auth.auth;
exports.upload = upload.uploadFile;