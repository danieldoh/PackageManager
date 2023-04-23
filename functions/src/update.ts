import {getStorage, ref, updateMetadata, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
const admin = require("firebase-admin");

import {validation} from "./validate";

const updateFile = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  const token: string | undefined = req.headers.authorization;
  if (token && packageID) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {data, metadata} = JSON.parse(JSON.stringify(req.body));
        const file = data.Content;
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const db = getFirestore(admin.apps[0]);
        const filename = packageID + ".bin";
        const storageRef = ref(storage, `${metadata.Name}/${filename}`);
        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        const doc = await packagesRef.get();
        if (doc.exists) {
          const docData: DocumentData | undefined = doc.data();
          const name: string = docData?.["Name"];
          const version: string = docData?.["Version"];
          const id: string = docData?.["ID"];
          if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
            await uploadString(storageRef, file, "base64");
            console.log("Updated the file");
            await updateMetadata(storageRef, metadata);
            res.status(200).send("Updated the package");
          } else {
            res.status(404).send("Package is not found.");
          }
        }
      } catch (error) {
        console.error(error);
        res.status(404).send("Package is not found.");
      }
    } else {
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.");
  }
};

export {updateFile};
