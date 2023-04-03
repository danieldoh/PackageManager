// const functions = require("firebase-admin");
const functions = require("firebase-functions");
const cors = require("cors")({origin: true});
const admin = require("firebase-admin");
const fs = require("fs");
/**
 * Upload the file in firestore storage
 * @param {String} filePath
 * @param {String} fileName
 */

// async function uploadLocalFileToStorage(filePath: string, fileName: string) {
exports.upload= functions.https.onRequest((req: any, res: any) => {
  const handleError = (filepath: string, error: any) => {
    functions.logger.error({User: filepath}, error);
    res.sendStatus(500);
    return;
  };

  const handleResponse = (filename: string, status: number, body: any) => {
    functions.logger.log(
      {User: filename},
      {
        Response: {
          Status: status,
          Body: body,
        },
      }
    );
    if (body) {
      return res.status(200).json(body);
    }
    return res.sendStatus(status);
  };

  const imageBucket = "images/";

  const bucket = admin.storage().bucket();
  const destination = `${imageBucket}${req.body.fileName}`;

  console.log(req.body.fileName);
  console.log(req.body.filePath);
  const stats = fs.statSync(req.body.filePath);
  console.log("is directory ? " + stats.isFile());

  try {
    return cors(req, res, async () => {
      // Uploads a local file to the bucket
      await bucket.upload(req.body.filePath, {
        destination: destination,
        gzip: true,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });

      console.log(`${req.body.fileName} uploaded to /${imageBucket}/${req.body.fileName}.`);
      return handleResponse(req.body.fileName, 200, `${req.body.fileName} uploaded to /${imageBucket}/${req.body.fileName}.`);
    });
  } catch (e) {
    return handleError(req.body.filePath, e);
  }
});
