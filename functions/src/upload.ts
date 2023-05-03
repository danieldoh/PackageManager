import {getDownloadURL, getStorage, ref, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
import {getLicense, getResponsiveness} from "./licAndResp";
import {getBusFactor} from "./busfactor";
const crypto = require("crypto");
const path = require("path");
const AdmZip = require("adm-zip");
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

interface metadataJson{
  name: string,
  version: string,
  id: string,
  repository: object,
}

interface rateJson {
  BusFactor: number;
  Correctness: number;
  RampUp: number;
  ResponsiveMaintainer: number;
  LicenseScore: number;
  GoodPinningPractice: number;
  PullRequest: number;
  NetScore: number;
}

/**
 * Generate ID
 * @param {number} bytes
 * @return {string}
 */
function getID(bytes: number): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Get metadata from package.json
 * @param {Buffer} decodeBuf
 * @param {string} tempID
 * @return {[metadataJson, object]}
 */
async function getMetadata(decodeBuf: Buffer, tempID: string): Promise<[metadataJson, object]> {
  const errorMeta: metadataJson = {
    name: "undefined",
    version: "undefined",
    id: "undefined",
    repository: {},
  };
  try {
    const zipFilePath = `/${firebaseConfig.tmp_folder}/${tempID}/${firebaseConfig.tmp_folder}.zip`;
    // console.log(zipFilePath);
    const extractPath = `/${firebaseConfig.tmp_folder}/${tempID}/extracted`;
    // console.log(extractPath);
    fs.mkdirSync(path.dirname(zipFilePath), {recursive: true});
    // console.log("Zip path created to:", path.dirname(zipFilePath));
    // Write the buffer to the zip file
    fs.writeFileSync(zipFilePath, decodeBuf);
    // console.log("Zip file saved to:", zipFilePath);

    // Create the directory where the extracted files will be stored
    fs.mkdirSync(extractPath, {recursive: true});
    // console.log("Extract path created:", extractPath);

    // Use adm-zip to extract the contents of the zip file
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(extractPath, true);
    // console.log("Zip file extracted to:", extractPath);

    // Use fs.readdir() to get a list of files in extractPath
    const files = fs.readdirSync(extractPath);
    // console.log("List of files in extractPath:", files);

    let validPath = extractPath;
    if (!files.includes("package.json")) {
      const index = files.indexOf("__MACOSX");
      if (index !== -1) {
        files.splice(index, 1);
      }
      const newFilePath = `/${firebaseConfig.tmp_folder}/${tempID}/extracted/package`;
      const oldFilePath = `/${firebaseConfig.tmp_folder}/${tempID}/extracted/${files[0]}`;

      fs.renameSync(oldFilePath, newFilePath);
      validPath = newFilePath;
    }
    // console.log(`upload: validpath ${validPath}`);
    // Read the package.json file and extract the name and version fields
    const packageJsonPath = path.join(validPath, "package.json");
    // console.log("Reading package.json file:", packageJsonPath);
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    // console.log(packageJson);
    let {name, version, id, repository} = packageJson;
    if (id == undefined ) {
      id = tempID;
    }
    // Log the package information
    const packageInfo: metadataJson = {name, version, id, repository};
    // console.log("Package information:", packageInfo);
    return [packageInfo, packageJson];
  } catch (error) {
    return [errorMeta, {}];
  }
}

/**
 * Downlaod file using URL
 * @param {string} originUrl
 * @param {string} filename
 * @return {string}
 */
async function downloadFile(originUrl: string, filename: string): Promise<string> {
  let url = originUrl + "/archive/main.zip";
  // console.log(url);
  let response = await fetch(url);

  // check if the request was successful
  if (response.status != 200) {
    url = originUrl + "/archive/master.zip";
    // console.log(url);
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
  console.log(`upload(request body): ${JSON.stringify(req.body)}`);
  // const rawBody: string [] = req.body;
  const rawHeaders: string[] = req.rawHeaders;
  console.log(`upload: headers ${rawHeaders}`);
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  console.log(`upload: ${token}`);
  if (token) {
    // token = (token) as string;
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {Content, URL} = JSON.parse(JSON.stringify(req.body));
        let content = "";
        let repoUrl: string | unknown = "undefined";
        if (Content && URL) {
          res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
        } else if (Content) {
          content = Content;
        } else if (URL) {
          console.log(URL);
          repoUrl = URL;
          await downloadFile(URL, "/tmp/dummy.zip").then((str) => {
            content = str;
          });
          // console.log("upload: downloaded file from URL");
        } else if (Content == null && URL == null) {
          res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
        }
        const tempID = getID(4);
        // console.log(`Upload: ID ${tempID}`);
        const decodebuf = Buffer.from(content, "base64");
        const contentResult = await getMetadata(decodebuf, tempID);
        // const packageJson = contentResult[1];
        const metadata = contentResult[0];
        if (metadata["name"] == "undefined") {
          res.status(424).send("Package is not uploaded due to the disqualified rating.");
        } else if (metadata["repository"] != undefined) {
          if ("url" in metadata["repository"]) {
            const tempUrl: unknown | string = metadata["repository"].url;
            if (typeof tempUrl == "string") {
              repoUrl = tempUrl.replace(".git", "");
            }
          }
        }
        if (repoUrl == "undefined") {
          res.status(424).send("Package is not uploaded due to the disqualified rating.");
        }
        console.log(`upload: ${repoUrl}`);

        let owner = "undefined";
        let repo = "undefined";

        if (typeof repoUrl == "string") {
          const repoInfo = repoUrl.split("/");
          const lastTwoParts = repoInfo.slice(-2);

          owner = lastTwoParts[0];
          console.log(owner);
          repo = lastTwoParts[1];
          console.log(repo);
        }


        const busfactor: number = await getBusFactor(owner, repo);
        const license: number= await getLicense(owner, repo);
        const responsiveness: number = await getResponsiveness(owner, repo);
        // const correctness: number = await (owner, repo);
        // const rampup: number = await (owner, repo);
        // const versionPinning: number = await (owner, repo);
        // const pullrequest: owner = await (owner, repo);

        const rate: rateJson = {
          "BusFactor": busfactor,
          "Correctness": 0,
          "RampUp": 0,
          "ResponsiveMaintainer": responsiveness,
          "LicenseScore": license,
          "GoodPinningPractice": 0,
          "PullRequest": 0,
          "NetScore": 0.5,
        };

        // console.log(rate);

        if (rate.NetScore < 0.5) {
          res.status(424).send("Package is not uploaded due to the disqualified rating.");
        }

        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const db = getFirestore(admin.apps[0]);
        const filename = metadata["id"] + ".bin";
        const storageRef = ref(storage, `${metadata["name"]}/${filename}`);
        await uploadString(storageRef, content, "base64");
        console.log("upload: uploaded the content(base64)");

        const packagesRef = db.collection(metadata["name"]).doc(metadata["version"]);
        const IdRef = db.collection("ID").doc(metadata["id"]);
        const IdDoc = await IdRef.get();
        const doc = await packagesRef.get();
        if (!doc.exists && !IdDoc.exists) {
          console.log("upload: checked ");
          const url = await getDownloadURL(storageRef);
          const newPackage = db.collection(metadata["name"]);
          await newPackage.doc(metadata["version"]).set({
            Name: metadata["name"],
            Version: metadata["version"],
            ID: metadata["id"],
            Download_URL: url,
            Repository_URL: repoUrl,
          });
          console.log("upload: created new metadata under metadata name collection with new version");
          const storageFolder = db.collection("storage");
          await storageFolder.doc(metadata["name"]).set({
            Folder: metadata["name"],
            Version: metadata["version"],
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
              Name: metadata["name"],
              Version: metadata["version"],
              Id: metadata["id"],
            },
            Action: "CREATE",
          };
          const historyRef = db.collection(metadata["name"]).doc("history");
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
          if (url != "undefined") {
            console.log(`upload: rate = ${rate}`);
          }
          const newID = db.collection("ID");
          await newID.doc(metadata["id"]).set({
            Name: metadata["name"],
            Version: metadata["version"],
            ID: metadata["id"],
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
            Name: metadata["name"],
            Version: metadata["version"],
            ID: metadata["id"],
          },
          data: {
            Content: content,
          },
        };
        res.status(201).send(responseInfo);
      } catch (error) {
        console.error(error);
        res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
      }
    } else {
      console.log("upload: wrong token");
      res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
    }
  } else {
    console.log("upload: missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageData/AuthenticationToken or it is formed improperly (e.g. Content and URL are both set), , or the AuthenticationToken is invalid.");
  }
};

export {uploadFile};
