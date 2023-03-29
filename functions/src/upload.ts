const functions = require("firebase-functions");
import {getStorage, ref, updateMetadata, uploadString} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase-admin/firestore";
const admin = require("firebase-admin");

exports.uploadFile = functions.https.onRequest(async (req: any, res: any) => {
  try {
    const {data, metadata} = JSON.parse(JSON.stringify(req.body));

    const file = data.Content;
    const firebaseConfig = {
      apiKey: "AIzaSyBv0YpZub_rr-nQ_fil5DhUjQGpPV9e6jQ",
      authDomain: "rest-api-b6587.firebaseapp.com",
      projectId: "rest-api-b6587",
      storageBucket: "rest-api-b6587.appspot.com",
      messagingSenderId: "276179708375",
      appId: "1:276179708375:web:d18b52c6e02dcc03f84392",
      measurementId: "G-13Y9JC2Y1S",
    };

    const firebaseApp = initializeApp(firebaseConfig);
    const storage = getStorage(firebaseApp);
    const db = getFirestore(admin.apps[0]);
    const storageRef = ref(storage, `package/${metadata.Name}`);

    await uploadString(storageRef, file, "base64");
    console.log("Uploaded a base64 file");
    await updateMetadata(storageRef, metadata);
    console.log("Updated");
    const packages = db.collection("packages").doc(metadata.Name);
    const doc = await packages.get();
    if (!doc.exists) {
      const newPackage = db.collection("packages");
      await newPackage.doc(metadata.Name).set({
        Name: metadata.Name,
        Version: metadata.Version,
        ID: metadata.ID,
      });
      console.log("The metadata is successfully saved.")
    } else {
      console.log("The file name is already existed.");
    }

    res.status(200).send(metadata);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
