import {getFirestore, DocumentData, FieldValue} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

interface rateJson {
  BusFactor: string;
  Correctness: string;
  RampUp: string;
  ResponsiveMaintainer: string;
  LicenseScore: string;
  GoodPinningPractice: string;
  PullRequest: string;
  NetScore: string;
}

interface historyJson {
  User: {
    name: string,
    isAdmin: boolean,
  };
  Date: string;
  PackageMetadata: {
    Name: string,
    Version: string,
    Id: string
  };
  Action: string;
}

const rate = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  console.log(`rate: packageID ${packageID}`);
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  // console.log(`rate: ${token}`);
  if (token && packageID) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const IdRef = db.collection("ID").doc(packageID);
        const IdDoc = await IdRef.get();
        const IdDocData: DocumentData | undefined = IdDoc.data();
        const rate: rateJson = IdDocData?.["Rate"];
        const name: string = IdDocData?.["Name"];
        const version: string = IdDocData?.["Version"];
        // console.log(`rate: ${rate}`);
        const pacakgeHistoryRef = db.collection(name);
        const timeDate = new Date().toLocaleString();
        const history: historyJson = {
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
            history: FieldValue.arrayUnion(history),
          });
        } else {
          await pacakgeHistoryRef.doc("history").set({
            history: [history],
          });
        }
        res.status(200).send(rate);
      } catch (err) {
        console.log(err);
        res.status(404).send("Package does not exist.");
      }
    } else {
      console.log("rate: The AuthenticationToken is invalid. ");
      res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
  } else {
    console.log("rate: There is missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid");
  }
};

export {rate};
