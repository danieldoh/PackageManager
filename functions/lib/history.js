"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.history = void 0;
const firestore_1 = require("firebase-admin/firestore");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const history = async (req, res) => {
    const packageName = req.params["packageName"];
    const token = req.headers.authorization;
    if (token && packageName) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const packagesRef = db.collection(packageName).doc("history");
                const doc = await packagesRef.get();
                if (doc.exists) {
                    const docData = doc.data();
                    const allHistory = docData === null || docData === void 0 ? void 0 : docData["history"];
                    res.status(200).send(allHistory);
                }
                else {
                    res.status(404).send("No Such Package");
                }
            }
            catch (error) {
                console.error(error);
                res.status(404).send("No Such Package");
            }
        }
        else {
            res.status(400).send("The AuthenticationToken is invalid.");
        }
    }
    else {
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.");
    }
};
exports.history = history;
//# sourceMappingURL=history.js.map