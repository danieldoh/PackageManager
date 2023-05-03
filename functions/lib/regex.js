"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const firestore_1 = require("firebase-admin/firestore");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const search = async (req, res) => {
    console.log(`regex: body ${JSON.stringify(req.body)}`);
    const rawHeaders = req.rawHeaders;
    const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
    const token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
    console.log(`regex: ${token}`);
    if (token) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const regEx = req.body.RegEx;
                const regexObj = new RegExp(regEx);
                // console.log(`regex: regex = ${regEx}`);
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const packagesListRef = db.collection("storage");
                const docs = await packagesListRef.get();
                const nameArray = [];
                docs.forEach((doc) => {
                    const docData = doc.data();
                    const packageName = docData["Folder"];
                    const packageVersion = docData["Version"];
                    const found = regexObj.test(packageName);
                    if (found) {
                        const packageInfo = {
                            Version: packageVersion,
                            Name: packageName,
                        };
                        nameArray.push(packageInfo);
                    }
                });
                if (nameArray.length == 0) {
                    console.log("regex: no package found under this regex.");
                    res.status(404).send("No package found under this regex.");
                }
                res.status(200).send(nameArray);
            }
            catch (err) {
                console.log(err);
                res.status(404).send("No package found under this regex.");
            }
        }
        else {
            console.log("regex: wrong token");
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("regex: missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
};
exports.search = search;
//# sourceMappingURL=regex.js.map