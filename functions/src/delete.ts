import * as functions from "firebase-functions";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";
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

export const fileDelete = functions.https.onRequest(async (req: Req, res: Res) => {
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
        
        // Create a ref to the file to delete
        const deleteRef = ref(storage, path);

        // Delete the file
        deleteObject(deleteRef).then(() => {
            console.log('File delected successfully!');
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
                case 'storage/retry-limit-exceeded':
                    console.log('Time limit. Try again.');
                    break;
                //
            }
        })

    } catch(err) {
        console.error(err);
        res.status(500).send(err);
    }
});