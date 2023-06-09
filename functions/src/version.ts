import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validation} from "./validate";
import * as semver from "semver";
const admin = require("firebase-admin");

/**
 * run semver and check version pinning
 * @param {string[]} versionArray
 * @param {string} versionRange
 * @return {string[]}
 */
function getVersionInRange(versionArray: string[], versionRange: string): string[] {
  return versionArray.filter((version) => semver.satisfies(version, versionRange));
}

interface responseJson {
  Version: string;
  Name: string;
  ID: string;
}

interface reqInfoJson {
  Version: string;
  Name: string;
}

const downloadVersion = async (req: Request, res: Response) => {
  console.log(`version(request body): ${JSON.stringify(req.body)}`);
  // console.log(`version(request headers): ${req.headers}`);
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  // console.log(`version: ${token}`);
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const db = getFirestore(admin.apps[0]);
        const responseInfo: responseJson[] = [];
        let count = 0;
        console.log(req.body[0]["Name"]);
        let reqInfo: reqInfoJson[] = [];
        if (req.body[0]["Name"] == "*") {
          const storageFolder = db.collection("storage");
          const folderList = await storageFolder.get();
          folderList.forEach((folder) => {
            const info = {
              Version: req.body[0]["Version"],
              Name: folder.id,
            };
            console.log(info);
            console.log(folder.id);
            reqInfo.push(info);
          });
        } else {
          reqInfo = req.body;
        }
        await Promise.all(req.body.forEach(async (obj: { Version: string; Name: string; }) => {
          console.log(`${obj}`);
          const version: string = obj.Version;
          const name: string = obj.Name;
          console.log(name);
          const nameRef = db.collection(name);
          const versionArray: string[] = [];
          const versions = await nameRef.get();
          versions.forEach((version) => {
            if (version.id != "history") {
              versionArray.push(version.id);
            }
          });
          // console.log(`version: ${versionArray}`);
          const versionPinning = getVersionInRange(versionArray, version);
          // console.log(`version: ${versionPinning} met condition`);
          if (versionPinning.length != 0) {
            const arrLen: number = versionPinning.length;
            const versionRef = db.collection(name).doc(versionPinning[arrLen - 1]);
            const versionDoc = await versionRef.get();
            const versionData: DocumentData | undefined = versionDoc.data();
            const id: string = versionData?.["ID"];
            const oneResponse: responseJson = {
              Version: versionPinning[arrLen - 1],
              Name: name,
              ID: id,
            };
            responseInfo.push(oneResponse);
          }
          // console.log(`version: finished ${version}, ${name}`);
          // console.log(`version: final ${responseInfo}`);
          count += 1;
        }));
        if (responseInfo.length > count) {
          res.status(413).send("Too many packages returned.");
        }
        // console.log(`version: ${responseInfo}`);
        res.status(200).send(responseInfo);
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    } else {
      console.log("version: Wrong authentication token");
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    console.log("version: Missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageQuery/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {downloadVersion};
