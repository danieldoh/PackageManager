import {getFirestore, DocumentData} from "firebase-admin/firestore";
import {Request, Response} from "express";
import {validation} from "./validate";
const admin = require("firebase-admin");

interface packageJson {
  Version: string;
  Name: string;
}

const search = async (req: Request, res: Response) => {
  console.log(`regex: body ${JSON.stringify(req.body)}`);
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  console.log(`regex: ${token}`);
  if (token) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const regEx: string = req.body.RegEx;
        const regexObj = new RegExp(regEx);
        // console.log(`regex: regex = ${regEx}`);
        const db = getFirestore(admin.apps[0]);
        const packagesListRef = db.collection("storage");
        const docs = await packagesListRef.get();
        const nameArray: packageJson[] = [];
        docs.forEach((doc) => {
          const docData: DocumentData | undefined = doc.data();
          const packageName: string = docData["Folder"];
          const packageVersion: string = docData["Version"];
          const found: boolean = regexObj.test(packageName);
          if (found) {
            const packageInfo: packageJson = {
              Version: packageVersion,
              Name: packageName,
            };
            nameArray.push(packageInfo);
          }
        });
        if (nameArray.length == 0) {
          console.log("regex: no package found under this regex.");
          res.status(404).send("No package found under this regex.");
        }
        res.status(200).send(nameArray);
      } catch (err) {
        console.log(err);
        res.status(404).send("No package found under this regex.");
      }
    } else {
      console.log("regex: wrong token");
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    console.log("regex: missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {search};
