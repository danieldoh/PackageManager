import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

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

const history = async (req: Request, res: Response) => {
  const packageName = req.params["packageName"];
  console.log(`history: packageId ${packageName}`);
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  // console.log(`history: ${token}`);
  if (token && packageName) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const packagesRef = db.collection(packageName).doc("history");
        const doc = await packagesRef.get();
        if (doc.exists) {
          // console.log("history: found the packageName in firestore");
          const docData: DocumentData | undefined = doc.data();
          const allHistory: historyJson[] = docData?.["history"];
          res.status(200).send(allHistory);
        } else {
          res.status(404).send("No Such Package");
        }
      } catch (error) {
        console.error(error);
        res.status(404).send("No Such Package");
      }
    } else {
      console.log("history: wrong token");
      res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
  } else {
    console.log("history: missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {history};
