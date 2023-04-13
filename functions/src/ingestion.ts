import * as functions from "firebase-functions";
import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase-admin/firestore";
const admin = require("firebase-admin");

type Req = functions.https.Request;
type Res = functions.Response

import { validation } from "./validate";

exports.ingestionURL = functions.https.onRequest(async (req: Req, res: Res) => {
  const authorizationHeader = req.headers.authorization;
  let token: string;
  if (authorizationHeader) {
    token = authorizationHeader;
    console.log(token);
    console.log(await validation(token));
    if (await validation(token)) {
      try {
        const {data, metadata} = JSON.parse(JSON.stringify(req.body));

        const url = data.URL;
        const firebaseConfig = {
          apiKey: "AIzaSyBv0YpZub_rr-nQ_fil5DhUjQGpPV9e6jQ",
          authDomain: "rest-api-b6587.firebaseapp.com",
          projectId: "rest-api-b6587",
          storageBucket: "rest-api-b6587.appspot.com",
          messagingSenderId: "276179708375",
          appId: "1:276179708375:web:d18b52c6e02dcc03f84392",
          measurementId: "G-13Y9JC2Y1S",
        };

        initializeApp(firebaseConfig);
        const db = getFirestore(admin.apps[0]);

        const packagesRef = db.collection(metadata.Name).doc(metadata.Version);
        const doc = await packagesRef.get();
        if (doc.exists) {
          console.log(doc.data());
          const docData: any = doc.data();
          console.log(docData);
          const name: string = docData['Name'];
          console.log(name);
          const version: string = docData['Version'];
          console.log(version);
          const id: string = docData['ID'];
          console.log(id);
          if (name == metadata.Name && version == metadata.Version && id == metadata.ID) {
            const ingestion_url = db.collection(metadata.Name);
            await ingestion_url.doc(metadata.Version).set({
              Name: metadata.Name,
              Version: metadata.Version,
              ID: metadata.ID,
              URL: url
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
});
