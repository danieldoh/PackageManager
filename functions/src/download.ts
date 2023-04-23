// import { initializeApp } from "firebase/app";
// import { firebaseConfig } from "./firebase";
import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

interface typeJson {
  metadata: {
    Version: string;
    Name: string;
    ID: string;
  },
  data: {
    Content: string;
  }
}

// get list of collections and remove 'token' from it
// and loop over the list of collections and check the versions by version pinning?
const downloadFile = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  const token: string | undefined = req.headers.authorization;
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const idRef = db.collection("ID").doc(packageID);
        const idInfo = await idRef.get();
        if (idInfo.exists) {
          const idData: DocumentData | undefined = idInfo.data();
          const packageName: string = idData?.["Name"];
          const packageVersion: string = idData?.["Version"];
          const url: string = idData?.["Download_URL"];
          const info: typeJson = {
            metadata: {
              Name: packageName,
              Version: packageVersion,
              ID: packageID,
            },
            data: {
              Content: url,
            },
          };
          res.status(200).send(info);
        } else {
          res.status(404).send("Package does not exist.");
        }
        /* if (doc.exists) {
          const docData: any = doc.data();
          const url: string = docData["Download_URL"];
          const xhr = new XMLHttpRequest();
          xhr.responseType = 'blob';
          xhr.onload = (event) => {
            // const blob = xhr.response;
          }
          xhr.open('GET', url);
          xhr.send()
        }
        console.log(versionPinning)*/
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    } else {
      res.status(401).send("Unauthorized");
    }
  } else {
    res.status(404).send("Token is undefined");
  }
};

export {downloadFile};
