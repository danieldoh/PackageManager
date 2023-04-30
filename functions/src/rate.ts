import {getFirestore, DocumentData} from "firebase-admin/firestore";
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

const rate = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  console.log(`rate: packageID ${packageID}`);
  let token: string | string[] | undefined = req.headers["x-authorization"];
  console.log(`rate: ${token}`);
  if (token && packageID) {
    token = (token) as string;
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const IdRef = db.collection("ID").doc(packageID);
        const IdDoc = await IdRef.get();
        const IdDocData: DocumentData | undefined = IdDoc.data();
        const rate: rateJson = IdDocData?.["Rate"];
        console.log(`rate: ${rate}`);
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
