import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject, listAll} from "firebase/storage";
import {getFirestore} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

const deleteAll = async (req: Request, res: Response) => {
  const packageName = req.params["packageName"];
  const token: string | undefined = req.headers.authorization;
  if (token && packageName) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `${packageName}`);
        const fileList = await listAll(storageRef);
        for (const item of fileList.items) {
          await deleteObject(ref(storage, item.fullPath));
        }
        const db = getFirestore(admin.apps[0]);
        const packagesRef = db.collection(packageName);
        const docs = await packagesRef.get();
        docs.forEach((doc) => {
          doc.ref.delete();
        });
        const storageFolder = db.collection("storage").doc(packageName);
        await storageFolder.delete();
        res.status(200).send("Package is deleted");
      } catch (err) {
        console.log(err);
        res.status(404).send("Package does not exist.");
      }
    } else {
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly.");
  }
};

export {deleteAll};
