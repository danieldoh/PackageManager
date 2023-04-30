import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validation} from "./validate";
const fetch = require("node-fetch");
const fs = require("fs");
const admin = require("firebase-admin");

interface contentJson {
  metadata: {
    Version: string;
    Name: string;
    ID: string;
  },
  data: {
    Content: string;
  }
}

interface urlJson {
  metadata: {
    Version: string;
    Name: string;
    ID: string;
  },
  data: {
    Content: string;
    URL: string;
  }
}

/**
 * Downlaod file using URL
 * @param {string} url
 * @param {string} filename
 * @return {string}
 */
async function downloadURL(url: string, filename: string): Promise<string> {
  const response = await fetch(url);

  if (response.status != 200) {
    throw new Error(`Unable to download file. HTTP status: ${response.status}`);
  }
  const buffer = await response.buffer();
  const base64String: string = buffer.toString("base64");
  fs.writeFileSync(filename, buffer);
  console.log("downlaod: File downloaded successfully");
  return base64String;
}

const downloadID = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  console.log(`download: packageId ${packageID}`);
  let token: string | string[] | undefined = req.headers["x-authorization"];
  console.log(`download: ${token}`);
  if (token) {
    token = (token) as string;
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const idRef = db.collection("ID").doc(packageID);
        const idInfo = await idRef.get();
        if (idInfo.exists) {
          console.log("download: found the package");
          const idData: DocumentData | undefined = idInfo.data();
          console.log(idData);
          const packageName: string = idData?.["Name"];
          const packageVersion: string = idData?.["Version"];
          const url: string = idData?.["Download_URL"];
          const repoUrl: string = idData?.["Repository_URL"];
          let content = "";
          await downloadURL(url, "/tmp/dummy.zip").then((str) => {
            content = str;
            console.log(content);
          });
          console.log("download: downloaded");
          if (repoUrl == "undefined") {
            const info: contentJson = {
              metadata: {
                Name: packageName,
                Version: packageVersion,
                ID: packageID,
              },
              data: {
                Content: content,
              },
            };
            res.status(200).send(info);
          } else if (repoUrl != "undefined") {
            const info: urlJson = {
              metadata: {
                Name: packageName,
                Version: packageVersion,
                ID: packageID,
              },
              data: {
                Content: content,
                URL: repoUrl,
              },
            };
            res.status(200).send(info);
          }
        } else {
          res.status(404).send("Package does not exist.");
        }
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    } else {
      console.log("download: wrong token");
      res.status(401).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
    }
  } else {
    console.log("download: missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {downloadID};

