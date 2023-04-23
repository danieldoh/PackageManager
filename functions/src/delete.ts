import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject} from "firebase/storage";
import {getFirestore} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

const fileDelete = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  const token: string | undefined = req.headers.authorization;
  if (token && packageID) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {metadata} = JSON.parse(JSON.stringify(req.body));
        console.log(firebaseConfig);
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const filename = packageID + ".bin";
        const storageRef = ref(storage, `${metadata.Name}/${filename}`);
        await deleteObject(storageRef);
        const db = getFirestore(admin.apps[0]);
        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        await packagesRef.delete();
        res.status(200).send("Package is deleted");
      } catch (err) {
        res.status(404).send("Package does not exist.");
      }
    } else {
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.");
  }
};

export {fileDelete};
