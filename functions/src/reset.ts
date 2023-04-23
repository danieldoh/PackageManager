import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject, listAll} from "firebase/storage";
import {getFirestore} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

const reset = async (req: Request, res: Response) => {
  const token: string | undefined = req.headers.authorization;
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const firebaseApp = initializeApp(firebaseConfig);
        // delete all folders in firebase storage
        const storage = getStorage(firebaseApp);
        console.log("until here");
        const db = getFirestore(admin.apps[0]);
        const storageFolder = db.collection("storage");
        const folderList = await storageFolder.get();
        const folderArray: string[] = [];
        folderList.forEach((folder) => {
          folderArray.push(folder.id);
        });
        for (const folder of folderArray) {
          const folderRef = ref(storage, `${folder}`);
          const filelist = await listAll(folderRef);
          for (const item of filelist.items) {
            await deleteObject(ref(storage, item.fullPath));
          }
        }
        const colList = await db.listCollections();
        for (const col of colList) {
          const docs = await col.get();
          docs.forEach((doc) => {
            doc.ref.delete();
          });
        }
        // default admin
        const firebaseToken = await admin.auth().createCustomToken("Daniel Doh");
        const idToken = "Bearer " + firebaseToken;
        const users = db.collection("Default Admin");
        await users.doc(idToken).set({
          Username: "Daniel Doh",
          Password: "helloworld",
          IdToken: idToken,
          Admin: "true",
        });
        res.status(200).send("Registry is reset");
      } catch (err) {
        console.log(err);
        res.status(404).send("Package does not exist.");
      }
    } else {
      res.status(401).send("You do not have permission to reset the registry.");
    }
  } else {
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {reset};