import {getStorage, ref, updateMetadata, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore, DocumentData, FieldValue} from "firebase-admin/firestore";
import {firebaseConfig} from "./firebase";
import {Request, Response} from "express";
import {validation} from "./validate";
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

interface metadataJson{
  name: string,
  version: string,
  id: string,
  repository: object,
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
  const zipFilePath = `/${firebaseConfig.tmp_folder}/${tempID}/${firebaseConfig.tmp_folder}.zip`;
  console.log(zipFilePath);
  const extractPath = `/${firebaseConfig.tmp_folder}/${tempID}/extracted`;
  console.log(extractPath);
  fs.mkdirSync(path.dirname(zipFilePath), {recursive: true});
  console.log("Zip path created to:", path.dirname(zipFilePath));
  // Write the buffer to the zip file
  fs.writeFileSync(zipFilePath, decodeBuf);
  console.log("Zip file saved to:", zipFilePath);

  // Create the directory where the extracted files will be stored
  fs.mkdirSync(extractPath, {recursive: true});
  console.log("Extract path created:", extractPath);

  // Use adm-zip to extract the contents of the zip file
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(extractPath, true);
  console.log("Zip file extracted to:", extractPath);

  // Use fs.readdir() to get a list of files in extractPath
  const files = fs.readdirSync(extractPath);
  console.log("List of files in extractPath:", files);

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
  console.log(`upload: validpath ${validPath}`);
  // Read the package.json file and extract the name and version fields
  const packageJsonPath = path.join(validPath, "package.json");
  console.log("Reading package.json file:", packageJsonPath);
  const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonContent);

  // console.log(packageJson);
  let {name, version, id, repository} = packageJson;
  if (id == undefined ) {
    id = tempID;
  }
  // Log the package information
  const packageInfo: metadataJson = {name, version, id, repository};
  console.log("Package information:", packageInfo);
  return [packageInfo, packageJson];
}

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

const updateFile = async (req: Request, res: Response) => {
  const packageID = req.params["packageID"];
  console.log(`update: packageID ${packageID}`);
  const rawHeaders: string[] = req.rawHeaders;
  const authHeaderIndex = rawHeaders.indexOf("X-Authorization");
  const token: string | undefined = authHeaderIndex !== -1 ? rawHeaders[authHeaderIndex + 1] : undefined;
  console.log(`update: ${token}`);
  if (token && packageID) {
    const authentication: [boolean, string] = await validation(token);
    if (authentication[0]) {
      try {
        const {data, metadata} = JSON.parse(JSON.stringify(req.body));
        const firebaseApp = initializeApp(firebaseConfig);
        const storage = getStorage(firebaseApp);
        const db = getFirestore(admin.apps[0]);
        const filename = packageID + ".bin";
        const storageRef = ref(storage, `${metadata.Name}/${filename}`);
        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        const IdRef = db.collection("ID").doc(packageID);
        const IdDoc = await IdRef.get();
        const doc = await packagesRef.get();
        if (doc.exists && IdDoc.exists) {
          console.log("update: found packageName and ID documents");
          const IdDocData: DocumentData | undefined = IdDoc.data();
          const name: string = IdDocData?.["Name"];
          const version: string = IdDocData?.["Version"];
          const id: string = IdDocData?.["ID"];
          if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
            console.log("update: all fields matched");

            let content = "";
            let repoUrl: string | unknown = "undefined";
            if (data.Content) {
              content = data.Content;
            } else if (data.URL) {
              console.log(URL);
              repoUrl = URL;
              await downloadFile(data.URL, "/tmp/dummy.zip").then((str) => {
                content = str;
                console.log(content);
              });
              console.log("upload: downloaded file from URL");
            }
            const tempID = getID(4);
            console.log(`Upload: ID ${tempID}`);
            const decodebuf = Buffer.from(content, "base64");
            const contentResult = await getMetadata(decodebuf, tempID);
            // const packageJson = contentResult[1];
            const metadataRepo = contentResult[0];
            if (metadataRepo["repository"] != undefined) {
              if ("url" in metadataRepo["repository"]) {
                const tempUrl: unknown | string = metadataRepo["repository"].url;
                if (typeof tempUrl == "string") {
                  repoUrl = tempUrl.replace(".git", "");
                }
              }
            }

            await uploadString(storageRef, content, "base64");
            await IdRef.update({Repository_URL: repoUrl});
            await packagesRef.update({Repository_URL: repoUrl});
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
            res.status(200).send("Version is updated.");
          } else {
            console.log("update: some fields are not matching");
            res.status(404).send("Package is not found.");
          }
        } else {
          console.log("update: packageId is not matching.");
          res.status(404).send("Package is not found.");
        }
      } catch (error) {
        console.error(error);
        res.status(404).send("Package is not found.");
      }
    } else {
      console.log("update: Wrong token");
      res.status(400).send("The AuthenticationToken is invalid.");
    }
  } else {
    console.log("update: Missing field(s)");
    res.status(400).send("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.");
  }
};

export {updateFile};
