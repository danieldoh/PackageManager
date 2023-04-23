import {initializeApp} from "firebase/app";
import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

const ingestionURL = async (req: Request, res: Response) => {
  const token: string | undefined = req.headers.authorization;
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {data, metadata} = JSON.parse(JSON.stringify(req.body));

        const url = data.URL;
        initializeApp(firebaseConfig);
        const db = getFirestore(admin.apps[0]);

        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        const doc = await packagesRef.get();
        if (doc.exists) {
          console.log(doc.data());
          const docData: DocumentData | undefined = doc.data();
          console.log(docData);
          const name: string = docData?.["Name"];
          console.log(name);
          const version: string = docData?.["Version"];
          console.log(version);
          const id: string = docData?.["ID"];
          console.log(id);
          if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
            const ingestionUrl = db.collection(metadata.Name);
            await ingestionUrl.doc(metadata.Version).set({
              Name: metadata.Name,
              Version: metadata.Version,
              ID: metadata.ID,
              URL: url,
            });
            res.status(200).send(metadata);
          } else {
            console.error("Metadata is not founded.");
            res.status(500).send("Metadata is not founded.");
          }
        }
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    } else {
      res.status(401).send("Unauthorized");
    }
  } else {
    res.status(404).send("Token is undefined");
  }
};

export {ingestionURL};
