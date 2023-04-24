import {initializeApp} from "firebase/app";
import {getStorage, ref, deleteObject} from "firebase/storage";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
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
  let token: string | string[] | undefined = req.headers["x-authorization"];
  if (token && packageID) {
    token = (token) as string;
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
        const pacakgeHistoryRef = db.collection(metadata.Name);
        const timeDate = new Date().toLocaleString();
        const history: historyJson = {
          User: {
            name: authentication[1],
            isAdmin: authentication[0],
          },
          Date: timeDate,
          PackageMetadata: {
            Name: metadata.Name,
            Version: metadata.Version,
            Id: metadata.ID,
          },
          Action: "DELETE",
        };
        const historyRef = db.collection(metadata.Name).doc("history");
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
