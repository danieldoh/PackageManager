import {getStorage, ref, updateMetadata, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore, DocumentData, FieldValue} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
const admin = require("firebase-admin");
import {validation} from "./validate";

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

const updateFile = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  let token: string | string[] | undefined = req.headers["x-authorization"];
  if (token && packageID) {
    token = (token) as string;
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
              Action: "UPDATE",
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
