import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject} from "firebase/storage";
import {getFirestore, FieldValue, DocumentData} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
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

const fileDelete = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  console.log(`Delete: packageID ${packageID}`);
  let token: string | string[] | undefined = req.headers["x-authorization"];
  console.log(`Delete: ${token}`);
  if (token && packageID) {
    token = (token) as string;
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const filename = packageID + ".bin";
        const db = getFirestore(admin.apps[0]);
        const IdRef = db.collection("ID").doc(packageID);
        const IdDoc = await IdRef.get();
        const IdDocData: DocumentData | undefined = IdDoc.data();
        const name: string = IdDocData?.["Name"];
        const version: string = IdDocData?.["Version"];
        const id: string = IdDocData?.["ID"];
        const storageRef = ref(storage, `${name}/${filename}`);
        await deleteObject(storageRef);
        console.log("delete: deleted from storage");
        const packagesRef = db.collection(name).doc(version);
        await packagesRef.delete();
        console.log("delete: deleted package collection");
        await IdRef.delete();
        console.log("delete: deleted id collection");
        const pacakgeHistoryRef = db.collection(name);
        const timeDate = new Date().toLocaleString();
        const history: historyJson = {
          User: {
            name: authentication[1],
            isAdmin: authentication[0],
          },
          Date: timeDate,
          PackageMetadata: {
            Name: name,
            Version: version,
            Id: id,
          },
          Action: "DELETE",
        };
        const historyRef = db.collection(name).doc("history");
        const historyDoc = await historyRef.get();
        if (historyDoc.exists) {
          await pacakgeHistoryRef.doc("history").update({
            history: FieldValue.arrayUnion(history),
          });
        } else {
          await pacakgeHistoryRef.doc("history").set({
            history: [history],
          });
        }
        console.log("delete: Package is deleted");
        res.status(200).send("Package is deleted");
      } catch (err) {
        console.log(err);
        res.status(404).send("Package does not exist.");
      }
    } else {
      console.log("Delete: The AuthenticationToken is invalid. ");
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    console.log("Delete: There is missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid");
  }
};

export {fileDelete};
