import {getDownloadURL, getStorage, ref, updateMetadata, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
const fetch = require("node-fetch");
const fs = require("fs");
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

interface responseJson {
  metadata: {
    Name: string,
    Version: string,
    ID: string,
  };
  data: {
    Content: string
  };
}

/* interface rateJson {
  BusFactor: string;
  Correctness: string;
  RampUp: string;
  ResponsiveMaintainer: string;
  LicenseScore: string;
  GoodPinningPractice: string;
  PullRequest: string;
  NetScore: string;
}*/

/**
 * Downlaod file using URL
 * @param {string} originUrl
 * @param {string} filename
 * @return {string}
 */
async function downloadFile(originUrl: string, filename: string): Promise<string> {
  let url = originUrl + "/archive/main.zip";
  console.log(url);
  let response = await fetch(url);

  // check if the request was successful
  if (response.status != 200) {
    url = originUrl + "/archive/master.zip";
    console.log(url);
  }
  response = await fetch(url);
  if (response.status != 200) {
    throw new Error(`Unable to download file. HTTP status: ${response.status}`);
  }
  const buffer = await response.buffer();
  const base64String: string = buffer.toString("base64");
  fs.writeFileSync(filename, buffer);
  console.log("File downloaded successfully");
  return base64String;
}

const uploadFile = async (req: Request, res: Response) => {
  console.log(`upload(request body): ${req.body}`);
  console.log(`upload(request headers): ${req.headers}`);
  let token: string | string[] | undefined = req.headers["x-authorization"];
  console.log(`upload: ${token}`);
  if (token) {
    token = (token) as string;
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {data, metadata} = JSON.parse(JSON.stringify(req.body));
        let content = "";
        let repoUrl = "undefined";
        if (data.Content) {
          content = data.Content;
        } else if (data.URL) {
          console.log(data.URL);
          repoUrl = data.URL;
          await downloadFile(data.URL, "/tmp/dummy.zip").then((str) => {
            content = str;
            console.log(content);
          });
          console.log("upload: downloaded file from URL");
        }
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const db = getFirestore(admin.apps[0]);
        const filename = metadata.ID + ".bin";
        const storageRef = ref(storage, `${metadata.Name}/${filename}`);
        await uploadString(storageRef, content, "base64");
        console.log("upload: uploaded the content(base64)");
        updateMetadata(storageRef, metadata);
        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        const IdRef = db.collection("ID").doc(metadata.ID);
        const IdDoc = await IdRef.get();
        const doc = await packagesRef.get();
        if (!doc.exists && !IdDoc.exists) {
          console.log("upload: checked ");
          const url = await getDownloadURL(storageRef);
          const newPackage = db.collection(metadata.Name);
          await newPackage.doc(metadata.Version).set({
            Name: metadata.Name,
            Version: metadata.Version,
            ID: metadata.ID,
            Download_URL: url,
            Repository_URL: repoUrl,
          });
          console.log("upload: created new metadata under metadata name collection with new version");
          const storageFolder = db.collection("storage");
          await storageFolder.doc(metadata.Name).set({
            Folder: metadata.Name,
          });
          console.log("upload: created the storage folder name document");
          // History
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
            Action: "CREATE",
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
          // ID
          const rate = {};
          if (url != "undefined") {
            console.log(`upload: rate = ${rate}`);
          }
          const newID = db.collection("ID");
          await newID.doc(metadata.ID).set({
            Name: metadata.Name,
            Version: metadata.Version,
            ID: metadata.ID,
            Download_URL: url,
            Repository_URL: repoUrl,
            Rate: rate,
          });
          console.log("upload: created the metadata under metadata ID document");
        } else {
          res.status(409).send("Package exists already.");
        }
        const responseInfo: responseJson = {
          metadata: {
            Name: metadata.Name,
            Version: metadata.Version,
            ID: metadata.ID,
          },
          data: {
            Content: content,
          },
        };
        res.status(200).send(responseInfo);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    } else {
      console.log("upload: wrong token");
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    console.log("upload: missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set).");
  }
};

export {uploadFile};
// 424: Package is not uploaded due to the disqualified rating.
