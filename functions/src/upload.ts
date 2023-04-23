import {getDownloadURL, getStorage, ref, updateMetadata, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
import * as https from "https";
// import * as zlib from "zlib";
import {Buffer} from "buffer";
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

const downloadFile = (url = "https://github.com/lodash/lodash/archive/master.zip"): Promise<string> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];
      response
        .on("data", (chunk: Buffer) => chunks.push(chunk))
        .on("end", () => {
          const buffer = Buffer.concat(chunks);
          const base64String = buffer.toString("base64");
          resolve(base64String);
        })
        .on("error", reject);
    });
  });
};

const uploadFile = async (req: Request, res: Response) => {
  const token: string | undefined = req.headers.authorization;
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {data, metadata} = JSON.parse(JSON.stringify(req.body));
        let content = "";
        if (data.Content) {
          content = data.Content;
        } else if (data.URL) {
          console.log(data.URL);
          const base64String = await downloadFile(data.URL);
          content = base64String;
        }
        const file = content;
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const db = getFirestore(admin.apps[0]);
        const filename = metadata.ID + ".bin";
        const storageRef = ref(storage, `${metadata.Name}/${filename}`);
        await uploadString(storageRef, file, "base64");
        updateMetadata(storageRef, metadata);
        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        const IdRef = db.collection("ID").doc(metadata.ID);
        const IdDoc = await IdRef.get();
        const doc = await packagesRef.get();
        if (!doc.exists || !IdDoc.exists) {
          const url = await getDownloadURL(storageRef);
          const newPackage = db.collection(metadata.Name);
          await newPackage.doc(metadata.Version).set({
            Name: metadata.Name,
            Version: metadata.Version,
            ID: metadata.ID,
            Download_URL: url,
          });
          const storageFolder = db.collection("storage");
          await storageFolder.doc(metadata.Name).set({
            Folder: metadata.Name,
          });
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
            Action: "Upload",
          };
          const historyRef = db.collection(metadata.Name).doc("history");
          const historyDoc = await historyRef.get();
          if (historyDoc.exists) {
            await newPackage.doc("history").update({
              history: FieldValue.arrayUnion(history),
            });
          } else {
            await newPackage.doc("history").set({
              history: [history],
            });
          }
          const newID = db.collection("ID");
          await newID.doc(metadata.ID).set({
            Name: metadata.Name,
            Version: metadata.Version,
            ID: metadata.ID,
            Download_URL: url,
          });
        } else {
          res.status(409).send("Package exists already.");
        }
        res.status(200).send(req.body);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    } else {
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set).");
  }
};

export {uploadFile};
