import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject, listAll} from "firebase/storage";
import {getFirestore} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

const reset = async (req: Request, res: Response) => {
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  console.log(`token: ${token}`);
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
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
      console.log(`reset: list of folders ${folderArray}`);
      for (const folder of folderArray) {
        const folderRef = ref(storage, `${folder}`);
        const filelist = await listAll(folderRef);
        for (const item of filelist.items) {
          await deleteObject(ref(storage, item.fullPath));
        }
      }
      console.log("reset: deleted all from the storage");
      const colList = await db.listCollections();
      console.log(`reset: list of collections ${colList}`);
      for (const col of colList) {
        if (col.id != "Default Admin") {
          const docs = await col.get();
          docs.forEach((doc) => {
            doc.ref.delete();
          });
        }
      }
      console.log("reset: deleted all from the firestore");
      // default admin
      /* const firebaseToken = await admin.auth().createCustomToken("Daniel Doh");
      const idToken = "Bearer " + firebaseToken;
      const users = db.collection("Default Admin");
      await users.doc(idToken).set({
        Username: "ece30861defaultadminuser",
        Password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
        IdToken: idToken,
        Admin: "true",
      }); */
      console.log("reset: created the default admin");
      res.status(200).send("Registry is reset");
    } else {
      console.log("reset: No permission");
      res.status(401).send("You do not have permission to reset the registry.");
    }
  } else {
    console.log("reset: missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {reset};
