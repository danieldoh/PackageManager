import * as functions from "firebase-functions";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
//import { getFirestore } from "firebase-admin/firestore";
//import { firebaseApp } from "../services/firebase";
const firebaseConfig = initializeApp({
    apiKey: "AIzaSyBv0YpZub_rr-nQ_fil5DhUjQGpPV9e6jQ",
    authDomain: "rest-api-b6587.firebaseapp.com",
    projectId: "rest-api-b6587",
    storageBucket: "rest-api-b6587.appspot.com",
    messagingSenderId: "276179708375",
    appId: "1:276179708375:web:d18b52c6e02dcc03f84392",
    measurementId: "G-13Y9JC2Y1S",
  });
type Req = functions.https.Request;
type Res = functions.Response;

export const fileDownload = functions.https.onRequest(async (req: Req, res: Res) => {
    try {
        const storage = getStorage(firebaseConfig);
        const storageRef = ref(storage);
        // Points to 'Package'
        const packageRef = ref(storageRef, 'package');
         // Points to package/Name
        const fileName = '${metadata.Name}';
        const nameRef = ref(packageRef, fileName); 
        // File-path is 'package/Name'
        const path = nameRef.fullPath;
        // File-name is 'Name' whatever stored in package from Storage
        //const name = nameRef.name;

        // Create a reference with an initial file path and name
        //const pathRef = ref(packageRef, name);
        
        // Create a ref from a GCS(Google Cloud Storage URI)
        const gcsRef = ref(storage, `gs://bucket/${path}`);
        
        // Create a ref from an HTTPS URL
        //const httpsRef = ref(storage, 'https://console.firebase.google.com/u/0/project/rest-api-b6587/storage/rest-api-b6587.appspot.com/files/~2Fpackage?hl=ko');

        // Storage download by url
        getDownloadURL(gcsRef)
            .then((url) => {
                // url is download URL for 'package/name'

                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    //const blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
            })
            .catch((err) => {
                switch(err.code) {
                    case 'storage/object-not-found':
                        console.log('File does not exist.');
                        break;
                    case 'storage/unauthorized' :
                        console.log('Do not have permission to access to download.');
                        break;
                    case 'storage/canceled':
                        console.log('Canceled the upload.');
                        break;
                    case 'storage/unknown':
                        console.log('Unknown error occurred, inspect the server response.');
                        break;
                    case 'storage/invalid-url':
                        console.log('Unvalid URL provided.');
                        break;
                }
            });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
    /*
    getDownloadURL(storageRef)
      .then((url) => {
        console.log(url);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err);
      });
      */
  });