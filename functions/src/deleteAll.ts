import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject, listAll} from "firebase/storage";
import {DocumentData, getFirestore} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

const deleteAll = async (req: Request, res: Response) => {
  const packageName = req.params["packageName"];
  console.log(`DeleteAll: packageName ${packageName}`);
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  // console.log(`DeleteAll: ${token}`);
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
        console.log("DeleteAll: deleted from storage");
        const db = getFirestore(admin.apps[0]);
        const packagesRef = db.collection(packageName);
        const docs = await packagesRef.get();
        const idArray: string[] = [];
        docs.forEach((doc) => {
          const docData: DocumentData | undefined = doc.data();
          if (docData["ID"] != undefined) {
            idArray.push(docData["ID"]);
          }
          doc.ref.delete();
        });
        console.log("DeleteAll: deleted from firestore");
        // console.log(idArray);
        for (const id of idArray) {
          const tempIdRef = db.collection("ID").doc(id);
          await tempIdRef.delete();
        }
        const storageFolder = db.collection("storage").doc(packageName);
        await storageFolder.delete();
        res.status(200).send("Package is deleted");
      } catch (err) {
        console.log(err);
        res.status(404).send("Package does not exist.");
      }
    } else {
      console.log("DeleteAll: Wrong authentication token");
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    console.log("DeleteAll: Missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {deleteAll};
