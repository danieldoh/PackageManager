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
  const token: string | undefined = req.headers.authorization;
  if (token && packageName) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const packagesRef = db.collection(packageName).doc("history");
        const doc = await packagesRef.get();
        if (doc.exists) {
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
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.");
  }
};

export {history};
