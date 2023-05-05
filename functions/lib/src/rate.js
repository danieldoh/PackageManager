"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rate = void 0;
const firestore_1 = require("firebase-admin/firestore");
const validate_1 = require("./validate");
const admin = require("firebase-admin");
const rate = async (req, res) => {
    const packageID = req.params["packageID"];
    console.log(`rate: packageID ${packageID}`);
    const rawHeaders = req.rawHeaders;
    const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
    const token = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
    // console.log(`rate: ${token}`);
    if (token && packageID) {
        const authentication = await (0, validate_1.validation)(token);
        if (authentication[0]) {
            try {
                const db = (0, firestore_1.getFirestore)(admin.apps[0]);
                const IdRef = db.collection("ID").doc(packageID);
                const IdDoc = await IdRef.get();
                const IdDocData = IdDoc.data();
                const rate = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Rate"];
                const name = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Name"];
                const version = IdDocData === null || IdDocData === void 0 ? void 0 : IdDocData["Version"];
                // console.log(`rate: ${rate}`);
                const pacakgeHistoryRef = db.collection(name);
                const timeDate = new Date().toLocaleString();
                const history = {
                    User: {
                        name: authentication[1],
                        isAdmin: authentication[0],
                    },
                    Date: timeDate,
                    PackageMetadata: {
                        Name: name,
                        Version: version,
                        Id: packageID,
                    },
                    Action: "RATE",
                };
                const historyRef = db.collection(name).doc("history");
                const historyDoc = await historyRef.get();
                if (historyDoc.exists) {
                    await pacakgeHistoryRef.doc("history").update({
                        history: firestore_1.FieldValue.arrayUnion(history),
                    });
                }
                else {
                    await pacakgeHistoryRef.doc("history").set({
                        history: [history],
                    });
                }
                res.status(200).send(rate);
            }
            catch (err) {
                console.log(err);
                res.status(404).send("Package does not exist.");
            }
        }
        else {
            console.log("rate: The AuthenticationToken is invalid. ");
            res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
        }
    }
    else {
        console.log("rate: There is missing field(s)");
        res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid");
    }
};
exports.rate = rate;
//# sourceMappingURL=rate.js.map